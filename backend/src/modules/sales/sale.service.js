import {
  createSale,
  findSales,
  findSaleById,
  findSaleByInvoiceNumber,
  updateSale,
  deleteSale,
  getSalesStats,
  getSalesByPaymentMethod,
  getTopProducts,
} from "./sale.repository.js";
import { findProductById } from "../products/product.repository.js";
import { adjustStock } from "../inventory/inventory.service.js";
import { MOVEMENT_TYPES } from "../../constants/inventoryTypes.js";
import { parsePaginationAndSort } from "../../utils/pagination.js";
import ApiError from "../../utils/ApiError.js";
import Sale from "./sale.model.js";

/**
 * Generar número de factura
 */
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const prefix = `INV-${year}${month}${day}-`;

  // Buscar el último número del día
  const lastSale = await Sale.findOne({
    invoiceNumber: new RegExp(`^${prefix}`),
  })
    .sort({ invoiceNumber: -1 })
    .limit(1);

  let sequence = 1;
  if (lastSale) {
    const lastNumber = parseInt(lastSale.invoiceNumber.split("-").pop());
    if (!isNaN(lastNumber)) {
      sequence = lastNumber + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(6, "0")}`;
};

export const createSaleService = async (saleData, userId) => {
  // Validar items
  if (!saleData.items || saleData.items.length === 0) {
    throw new ApiError(400, "At least one item is required");
  }

  // Procesar items
  const processedItems = [];
  let subtotal = 0;
  let totalDiscount = 0;

  for (const item of saleData.items) {
    const product = await findProductById(item.product);
    if (!product) {
      throw new ApiError(404, `Product ${item.product} not found`);
    }

    if (!product.isActive) {
      throw new ApiError(400, `Product ${product.name} is inactive`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      );
    }

    const itemDiscount = item.discount || 0;
    const itemTotal = item.unitPrice * item.quantity - itemDiscount;

    processedItems.push({
      product: product._id,
      name: product.name,
      sku: product.SKU,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: itemDiscount,
      total: itemTotal,
    });

    subtotal += item.unitPrice * item.quantity;
    totalDiscount += itemDiscount;
  }

  // Calcular totales
  const discount = saleData.discount || 0;
  const tax = saleData.tax || 0;
  const total = subtotal - discount + tax;

  // Generar número de factura
  const invoiceNumber = await generateInvoiceNumber();

  // Crear venta
  const sale = await createSale({
    invoiceNumber,
    customer: saleData.customer || null,
    customerInfo: saleData.customerInfo || null,
    items: processedItems,
    subtotal,
    discount,
    tax,
    total,
    paymentMethod: saleData.paymentMethod,
    paymentStatus: "paid",
    status: "completed",
    notes: saleData.notes,
    createdBy: userId,
  });

  // Actualizar stock de productos
  for (const item of processedItems) {
    await adjustStock({
      productId: item.product,
      type: MOVEMENT_TYPES.SALE_OUT,
      quantity: item.quantity,
      unitCost: 0,
      reference: sale.invoiceNumber,
      referenceModel: "Sale",
      notes: `Sale #${sale.invoiceNumber}`,
      performedBy: userId,
    });
  }

  return sale;
};

/**
 * Obtener ventas con filtros
 */
export const getSalesService = async (query = {}) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.customer) filter.customer = query.customer;
  if (query.createdBy) filter.createdBy = query.createdBy;

  if (query.search) {
    filter.$or = [
      { invoiceNumber: { $regex: query.search, $options: "i" } },
      { "customerInfo.name": { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  if (query.minTotal || query.maxTotal) {
    filter.total = {};
    if (query.minTotal) filter.total.$gte = parseFloat(query.minTotal);
    if (query.maxTotal) filter.total.$lte = parseFloat(query.maxTotal);
  }

  const { skip, limit, sort } = parsePaginationAndSort(query, {
    page: 1,
    limit: 50,
    maxLimit: 200,
    defaultSort: { createdAt: -1 },
  });

  return await findSales(filter, { skip, limit, sort });
};

/**
 * Obtener venta por ID
 */
export const getSaleService = async (id) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }
  return sale;
};

/**
 * Obtener venta por número de factura
 */
export const getSaleByInvoiceService = async (invoiceNumber) => {
  const sale = await findSaleByInvoiceNumber(invoiceNumber);
  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }
  return sale;
};

/**
 * Actualizar venta
 */
export const updateSaleService = async (id, updateData, userId) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }

  if (sale.status === "cancelled" || sale.status === "refunded") {
    throw new ApiError(400, `Cannot update ${sale.status} sale`);
  }

  // ✅ Retorno directo
  return await updateSale(id, updateData);
};

/**
 * Cancelar venta
 */
export const cancelSaleService = async (id, reason, userId) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }

  if (sale.status === "cancelled") {
    throw new ApiError(400, "Sale is already cancelled");
  }

  // Restaurar stock
  for (const item of sale.items) {
    await adjustStock({
      productId: item.product,
      type: MOVEMENT_TYPES.RETURN_IN,
      quantity: item.quantity,
      unitCost: 0,
      reference: sale.invoiceNumber,
      referenceModel: "Sale",
      notes: `Cancellation of sale #${sale.invoiceNumber}`,
      performedBy: userId,
    });
  }

  // ✅ Retorno directo
  return await updateSale(id, {
    status: "cancelled",
    cancelledAt: new Date(),
    cancelledBy: userId,
    cancellationReason: reason,
  });
};

/**
 * Eliminar venta (solo admin)
 */
export const deleteSaleService = async (id) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }

  return await deleteSale(id);
};

/**
 * Obtener estadísticas de ventas
 */
export const getSalesStatsService = async (startDate, endDate) => {
  const stats = await getSalesStats(startDate, endDate);
  const paymentStats = await getSalesByPaymentMethod(startDate, endDate);
  const topProducts = await getTopProducts(startDate, endDate, 10);

  return {
    summary: stats,
    byPaymentMethod: paymentStats,
    topProducts,
  };
};

/**
 * Obtener ventas del día
 */
export const getTodaySalesService = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter = {
    createdAt: { $gte: today, $lt: tomorrow },
    status: "completed",
  };

  const { sales, total } = await findSales(filter);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);

  return {
    totalSales,
    totalRevenue,
    totalItems,
    sales,
  };
};
