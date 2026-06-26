import Sale from "./sale.model.js";

// ✅ Asegurar que todas las funciones estén exportadas
export const createSale = async (data) => {
  return await Sale.create(data);
};

export const findSales = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate("customer", "name email phone")
      .populate("createdBy", "name email")
      .populate("cancelledBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Sale.countDocuments(filter),
  ]);

  return {
    sales,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
};

export const findSaleById = async (id) => {
  return await Sale.findById(id)
    .populate("customer", "name email phone address")
    .populate("createdBy", "name email")
    .populate("cancelledBy", "name email");
};

export const findSaleByInvoiceNumber = async (invoiceNumber) => {
  return await Sale.findOne({ invoiceNumber })
    .populate("customer", "name email phone")
    .populate("createdBy", "name email");
};

export const updateSale = async (id, data) => {
  return await Sale.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
};

export const deleteSale = async (id) => {
  return await Sale.findByIdAndDelete(id);
};

export const getSalesStats = async (startDate, endDate) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const stats = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
        totalDiscount: { $sum: "$discount" },
        totalTax: { $sum: "$tax" },
        averageSale: { $avg: "$total" },
        totalItems: { $sum: { $size: "$items" } },
      },
    },
  ]);

  return (
    stats[0] || {
      totalSales: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      totalTax: 0,
      averageSale: 0,
      totalItems: 0,
    }
  );
};

export const getSalesByPaymentMethod = async (startDate, endDate) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$paymentMethod",
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);
};

export const getTopProducts = async (startDate, endDate, limit = 10) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return await Sale.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        productName: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.total" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
  ]);
};
