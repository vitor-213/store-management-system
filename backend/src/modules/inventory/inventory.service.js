import {
  createMovement,
  findMovements,
  findMovementById,
  aggregateMovementsByProduct,
  findProductById,
  updateProductStock,
  createAlert,
  findAlerts,
  findAlertById,
  updateAlertById,
  findActiveAlertForProduct,
  findProductsLowStock,
} from "./inventory.repository.js";
import { MOVEMENT_TYPES, MOVEMENT_DIRECTIONS, ALERT_STATUSES } from "../../constants/inventoryTypes.js";
import { parsePaginationAndSort } from "../../utils/pagination.js";
import ApiError from "../../utils/ApiError.js";

const INBOUND_TYPES = new Set([
  MOVEMENT_TYPES.PURCHASE_IN,
  MOVEMENT_TYPES.RETURN_IN,
  MOVEMENT_TYPES.TRANSFER_IN,
  MOVEMENT_TYPES.INITIAL,
]);

const OUTBOUND_TYPES = new Set([
  MOVEMENT_TYPES.SALE_OUT,
  MOVEMENT_TYPES.RETURN_OUT,
  MOVEMENT_TYPES.TRANSFER_OUT,
]);

export const adjustStock = async ({ productId, type, quantity, unitCost, reference, referenceModel, reason, notes, performedBy }) => {
  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let direction;
  let effectiveQuantity;

  if (type === MOVEMENT_TYPES.ADJUSTMENT) {
    if (reason === "set") {
      effectiveQuantity = Math.abs(quantity - product.stock);
      direction = quantity > product.stock ? MOVEMENT_DIRECTIONS.IN : MOVEMENT_DIRECTIONS.OUT;
    } else {
      direction = quantity >= 0 ? MOVEMENT_DIRECTIONS.IN : MOVEMENT_DIRECTIONS.OUT;
      effectiveQuantity = Math.abs(quantity);
    }
  } else if (INBOUND_TYPES.has(type)) {
    direction = MOVEMENT_DIRECTIONS.IN;
    effectiveQuantity = Math.abs(quantity);
  } else if (OUTBOUND_TYPES.has(type)) {
    direction = MOVEMENT_DIRECTIONS.OUT;
    effectiveQuantity = Math.abs(quantity);
  } else {
    throw new ApiError(400, `Invalid movement type: ${type}`);
  }

  if (effectiveQuantity <= 0) {
    throw new ApiError(400, "Quantity must be greater than 0");
  }

  const stockBefore = product.stock;
  const stockAfter = direction === MOVEMENT_DIRECTIONS.IN
    ? stockBefore + effectiveQuantity
    : stockBefore - effectiveQuantity;

  if (stockAfter < 0) {
    throw new ApiError(422, `Insufficient stock. Available: ${stockBefore}, requested: ${effectiveQuantity}`);
  }

  const totalCost = effectiveQuantity * (unitCost || 0);

  const movement = await createMovement({
    product: productId,
    type,
    direction,
    quantity: effectiveQuantity,
    stockBefore,
    stockAfter,
    unitCost: unitCost || 0,
    totalCost,
    reference,
    referenceModel,
    reason: reason || null,
    notes,
    performedBy,
  });

  await updateProductStock(productId, stockAfter);

  await checkAndCreateAlert(productId, stockAfter);

  return movement;
};

export const getMovements = async (query = {}) => {
  const filter = {};

  if (query.productId) {
    filter.product = query.productId;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.direction) {
    filter.direction = query.direction;
  }

  if (query.reference) {
    filter.reference = query.reference;
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const { skip, limit, sort } = parsePaginationAndSort(query, {
    page: 1,
    limit: 50,
    maxLimit: 200,
    defaultSort: { createdAt: -1 },
  });

  return await findMovements(filter, { skip, limit, sort });
};

export const getMovement = async (id) => {
  const movement = await findMovementById(id);
  if (!movement) {
    throw new ApiError(404, "Movement not found");
  }
  return movement;
};

export const getProductInventorySummary = async (productId, startDate, endDate) => {
  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const aggregation = await aggregateMovementsByProduct(productId, startDate, endDate);

  const summary = {
    product,
    currentStock: product.stock,
    totalIn: 0,
    totalOut: 0,
    totalInCost: 0,
    totalOutCost: 0,
    movementCount: 0,
  };

  for (const entry of aggregation) {
    if (entry._id === MOVEMENT_DIRECTIONS.IN) {
      summary.totalIn = entry.totalQuantity;
      summary.totalInCost = entry.totalCost;
    } else if (entry._id === MOVEMENT_DIRECTIONS.OUT) {
      summary.totalOut = entry.totalQuantity;
      summary.totalOutCost = entry.totalCost;
    }
    summary.movementCount += entry.count;
  }

  return summary;
};

export const getAlerts = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.productId) {
    filter.product = query.productId;
  }

  const { skip, limit, sort } = parsePaginationAndSort(query, {
    page: 1,
    limit: 50,
    maxLimit: 200,
    defaultSort: { createdAt: -1 },
  });

  return await findAlerts(filter, { skip, limit, sort });
};

export const getAlert = async (id) => {
  const alert = await findAlertById(id);
  if (!alert) {
    throw new Error("Alert not found");
  }
  return alert;
};

export const acknowledgeAlert = async (id, userId) => {
  const alert = await findAlertById(id);
  if (!alert) {
    throw new ApiError(404, "Alert not found");
  }

  return await updateAlertById(id, {
    status: ALERT_STATUSES.ACKNOWLEDGED,
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  });
};

export const resolveAlert = async (id) => {
  const alert = await findAlertById(id);
  if (!alert) {
    throw new ApiError(404, "Alert not found");
  }

  return await updateAlertById(id, {
    status: ALERT_STATUSES.RESOLVED,
    resolvedAt: new Date(),
  });
};

export const bulkCheckLowStock = async () => {
  const lowStockProducts = await findProductsLowStock();
  const alertsCreated = [];

  for (const product of lowStockProducts) {
    const existingAlert = await findActiveAlertForProduct(product._id);
    if (!existingAlert) {
      const alert = await createAlert({
        product: product._id,
        type: product.stock === 0 ? "out_of_stock" : "low_stock",
        currentStock: product.stock,
        minStock: product.minStock,
        message: product.stock === 0
          ? `${product.name} (${product.SKU}) is out of stock`
          : `${product.name} (${product.SKU}) is low on stock. Current: ${product.stock}, Minimum: ${product.minStock}`,
      });
      alertsCreated.push(alert);
    }
  }

  return {
    checked: lowStockProducts.length,
    created: alertsCreated.length,
    alerts: alertsCreated,
  };
};

async function checkAndCreateAlert(productId, currentStock) {
  const product = await findProductById(productId);
  if (!product || !product.isActive) return;

  const existingAlert = await findActiveAlertForProduct(productId);

  if (currentStock <= product.minStock) {
    if (!existingAlert) {
      await createAlert({
        product: productId,
        type: currentStock === 0 ? "out_of_stock" : "low_stock",
        currentStock,
        minStock: product.minStock,
        message: currentStock === 0
          ? `${product.name} (${product.SKU}) is out of stock`
          : `${product.name} (${product.SKU}) is low on stock. Current: ${currentStock}, Minimum: ${product.minStock}`,
      });
    } else if (existingAlert.status === ALERT_STATUSES.RESOLVED) {
      await createAlert({
        product: productId,
        type: currentStock === 0 ? "out_of_stock" : "low_stock",
        currentStock,
        minStock: product.minStock,
        message: currentStock === 0
          ? `${product.name} (${product.SKU}) is out of stock`
          : `${product.name} (${product.SKU}) is low on stock. Current: ${currentStock}, Minimum: ${product.minStock}`,
      });
    }
  } else if (existingAlert && existingAlert.status === ALERT_STATUSES.ACTIVE) {
    await updateAlertById(existingAlert._id, {
      status: ALERT_STATUSES.RESOLVED,
      resolvedAt: new Date(),
    });
  }
}
