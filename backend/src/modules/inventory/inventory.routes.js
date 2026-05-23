import express from "express";

import {
  createMovement,
  getMovementsList,
  getMovementById,
  getInventorySummary,
  getAlertsList,
  getAlertById,
  acknowledgeAlertById,
  resolveAlertById,
  checkLowStock,
} from "./inventory.controller.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  createMovementSchema,
  movementQuerySchema,
  alertQuerySchema,
  inventorySummaryQuerySchema,
} from "./inventory.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/movements",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  validate(createMovementSchema),
  createMovement,
);

router.get(
  "/movements",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  validate(movementQuerySchema, "query"),
  getMovementsList,
);

router.get(
  "/movements/:id",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  getMovementById,
);

router.get(
  "/products/:productId/summary",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  validate(inventorySummaryQuerySchema, "query"),
  getInventorySummary,
);

router.post(
  "/alerts/check",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  checkLowStock,
);

router.get(
  "/alerts",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  validate(alertQuerySchema, "query"),
  getAlertsList,
);

router.get(
  "/alerts/:id",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  getAlertById,
);

router.patch(
  "/alerts/:id/acknowledge",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  acknowledgeAlertById,
);

router.patch(
  "/alerts/:id/resolve",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  resolveAlertById,
);

export default router;
