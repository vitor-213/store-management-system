import StockMovement from "./inventory.model.js";
import InventoryAlert from "./inventoryAlert.model.js";
import Product from "../products/product.model.js";

export const createMovement = async (data) => {
  return await StockMovement.create(data);
};

export const findMovements = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate("product", "name SKU image")
      .populate("performedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    StockMovement.countDocuments(filter),
  ]);
  return {
    movements,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
};

export const findMovementById = async (id) => {
  return await StockMovement.findById(id)
    .populate("product", "name SKU image category")
    .populate("performedBy", "name email");
};

export const aggregateMovementsByProduct = async (
  productId,
  startDate,
  endDate,
) => {
  const match = { product: productId };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return await StockMovement.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$direction",
        totalQuantity: { $sum: "$quantity" },
        totalCost: { $sum: "$totalCost" },
        count: { $sum: 1 },
      },
    },
  ]);
};

export const findProductById = async (id) => {
  return await Product.findById(id);
};

export const updateProductStock = async (id, newStock) => {
  return await Product.findByIdAndUpdate(
    id,
    { stock: newStock },
    { new: true, runValidators: true },
  );
};

export const createAlert = async (data) => {
  return await InventoryAlert.create(data);
};

export const findAlerts = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
  const [alerts, total] = await Promise.all([
    InventoryAlert.find(filter)
      .populate("product", "name SKU image category minStock stock unit")
      .populate("acknowledgedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    InventoryAlert.countDocuments(filter),
  ]);
  return {
    alerts,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
};

export const findAlertById = async (id) => {
  return await InventoryAlert.findById(id)
    .populate("product", "name SKU image category minStock stock unit")
    .populate("acknowledgedBy", "name email");
};

export const updateAlertById = async (id, data) => {
  return await InventoryAlert.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const findActiveAlertForProduct = async (
  productId,
  type = "low_stock",
) => {
  return await InventoryAlert.findOne({
    product: productId,
    type,
    status: { $in: ["active", "acknowledged"] },
  });
};

export const findProductsLowStock = async () => {
  return await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$minStock"] },
  });
};
