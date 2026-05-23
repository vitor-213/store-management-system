import { z } from "zod";
import { MOVEMENT_TYPES } from "../../constants/inventoryTypes.js";

export const createMovementSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.enum(Object.values(MOVEMENT_TYPES)),
  quantity: z.number().positive("Quantity must be positive"),
  unitCost: z.number().min(0).optional(),
  reference: z.string().optional(),
  referenceModel: z.string().optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
}).refine((data) => {
  if (data.type === MOVEMENT_TYPES.ADJUSTMENT && !data.reason) {
    return false;
  }
  return true;
}, { message: "Reason is required for stock adjustments", path: ["reason"] });

export const movementQuerySchema = z.object({
  productId: z.string().optional(),
  type: z.string().optional(),
  direction: z.enum(["in", "out"]).optional(),
  reference: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export const alertQuerySchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  productId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export const inventorySummaryQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
