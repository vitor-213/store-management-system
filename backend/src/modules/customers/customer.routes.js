import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();
router.use(authMiddleware);

// Aquí irán las rutas de clientes cuando las implementes

export default router;
