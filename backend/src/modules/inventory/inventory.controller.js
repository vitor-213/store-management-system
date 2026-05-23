import {
  adjustStock,
  getMovements,
  getMovement,
  getProductInventorySummary,
  getAlerts,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
  bulkCheckLowStock,
} from "./inventory.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createMovement = asyncHandler(async (req, res) => {
  const movement = await adjustStock({
    ...req.body,
    performedBy: req.user._id,
  });
  res.status(201).json({ success: true, data: movement });
});

export const getMovementsList = asyncHandler(async (req, res) => {
  const result = await getMovements(req.query);
  res.json({ success: true, ...result });
});

export const getMovementById = asyncHandler(async (req, res) => {
  const movement = await getMovement(req.params.id);
  res.json({ success: true, data: movement });
});

export const getInventorySummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await getProductInventorySummary(
    req.params.productId,
    startDate,
    endDate,
  );
  res.json({ success: true, data: summary });
});

export const getAlertsList = asyncHandler(async (req, res) => {
  const result = await getAlerts(req.query);
  res.json({ success: true, ...result });
});

export const getAlertById = asyncHandler(async (req, res) => {
  const alert = await getAlert(req.params.id);
  res.json({ success: true, data: alert });
});

export const acknowledgeAlertById = asyncHandler(async (req, res) => {
  const alert = await acknowledgeAlert(req.params.id, req.user._id);
  res.json({ success: true, data: alert });
});

export const resolveAlertById = asyncHandler(async (req, res) => {
  const alert = await resolveAlert(req.params.id);
  res.json({ success: true, data: alert });
});

export const checkLowStock = asyncHandler(async (req, res) => {
  const result = await bulkCheckLowStock();
  res.json({ success: true, ...result });
});
