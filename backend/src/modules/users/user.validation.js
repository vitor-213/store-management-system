import { z } from "zod";
import { ROLES } from "../../constants/roles.js";

export const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: "isActive is required" }),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});
