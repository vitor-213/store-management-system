import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { register, login, getMe } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, getMe);

export default router;
