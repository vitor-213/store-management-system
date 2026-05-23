import express from "express";

import {
  getUsers,
  getUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from "./user.controller.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  updateUserRoleSchema,
  toggleUserStatusSchema,
} from "./user.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER), getUsers);

router.get("/:id", roleMiddleware(ROLES.ADMIN, ROLES.MANAGER), getUser);

router.patch(
  "/:id/role",
  roleMiddleware(ROLES.ADMIN),
  validate(updateUserRoleSchema),
  updateUserRole,
);

router.patch(
  "/:id/status",
  roleMiddleware(ROLES.ADMIN),
  validate(toggleUserStatusSchema),
  toggleUserStatus,
);

router.delete("/:id", roleMiddleware(ROLES.ADMIN), deleteUser);

export default router;
