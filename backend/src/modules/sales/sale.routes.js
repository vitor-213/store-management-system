import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  createSale,
  getSales,
  getSale,
  getSaleByInvoice,
  updateSale,
  cancelSale,
  deleteSale,
  getSalesStats,
  getTodaySales,
} from "./sale.controller.js";
import {
  createSaleSchema,
  updateSaleSchema,
  cancelSaleSchema,
  saleQuerySchema,
  saleIdSchema,
} from "./sale.validation.js";

const router = express.Router();

router.use(authMiddleware);

// Rutas de estadísticas (acceso para todos los roles)
router.get("/stats", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER), getSalesStats);

router.get(
  "/today",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  getTodaySales,
);

// Rutas principales
router.get(
  "/",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  validate(saleQuerySchema, "query"),
  getSales,
);

router.get(
  "/invoice/:invoice",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  getSaleByInvoice,
);

router.get(
  "/:id",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE),
  validate(saleIdSchema, "params"),
  getSale,
);

// Rutas de creación y modificación (solo admin y manager)
router.post(
  "/",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  validate(createSaleSchema),
  createSale,
);

router.put(
  "/:id",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  validate(saleIdSchema, "params"),
  validate(updateSaleSchema),
  updateSale,
);

router.patch(
  "/:id/cancel",
  roleMiddleware(ROLES.ADMIN, ROLES.MANAGER),
  validate(saleIdSchema, "params"),
  validate(cancelSaleSchema),
  cancelSale,
);

router.delete(
  "/:id",
  roleMiddleware(ROLES.ADMIN),
  validate(saleIdSchema, "params"),
  deleteSale,
);

export default router;
