import {
  createSaleService,
  getSalesService,
  getSaleService,
  getSaleByInvoiceService,
  updateSaleService,
  cancelSaleService,
  deleteSaleService,
  getSalesStatsService,
  getTodaySalesService,
} from "./sale.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createSale = asyncHandler(async (req, res) => {
  const sale = await createSaleService(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: "Sale created successfully",
    data: sale,
  });
});

export const getSales = asyncHandler(async (req, res) => {
  const result = await getSalesService(req.query);
  res.json({
    success: true,
    data: result.sales,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total,
    },
  });
});

export const getSale = asyncHandler(async (req, res) => {
  const sale = await getSaleService(req.params.id);
  res.json({ success: true, data: sale });
});

export const getSaleByInvoice = asyncHandler(async (req, res) => {
  const sale = await getSaleByInvoiceService(req.params.invoice);
  res.json({ success: true, data: sale });
});

export const updateSale = asyncHandler(async (req, res) => {
  const sale = await updateSaleService(req.params.id, req.body, req.user._id);
  res.json({
    success: true,
    message: "Sale updated successfully",
    data: sale,
  });
});

export const cancelSale = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const sale = await cancelSaleService(req.params.id, reason, req.user._id);
  res.json({
    success: true,
    message: "Sale cancelled successfully",
    data: sale,
  });
});

export const deleteSale = asyncHandler(async (req, res) => {
  await deleteSaleService(req.params.id);
  res.json({ success: true, message: "Sale deleted successfully" });
});

export const getSalesStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await getSalesStatsService(startDate, endDate);
  res.json({ success: true, data: stats });
});

export const getTodaySales = asyncHandler(async (req, res) => {
  const result = await getTodaySalesService();
  res.json({ success: true, data: result });
});
