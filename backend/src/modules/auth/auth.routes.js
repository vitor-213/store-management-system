import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";

import { register, login, getMe } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router;
