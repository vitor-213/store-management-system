import express from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "./product.controller.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { ROLES } from "../../constants/roles.js";
import { createProductSchema, updateProductSchema, productQuerySchema } from "./product.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), validate(productQuerySchema, "query"), getProducts);

router.get("/:id", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), getProduct);

router.post("/", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER), validate(createProductSchema), createProduct);

router.put("/:id", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER), validate(updateProductSchema), updateProduct);

router.patch("/:id/status", roleMiddleware(ROLES.ADMIN), toggleProductStatus);

router.delete("/:id", roleMiddleware(ROLES.ADMIN), deleteProduct);

export default router;
