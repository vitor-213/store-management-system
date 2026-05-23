import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";

import { register, login, getMe } from "./auth.controller.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";

import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome admin",
    });
  },
);

export default router;
