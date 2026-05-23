import { z } from "zod";

export const productUnitEnum = z.enum([
  "pcs", "kg", "g", "l", "ml", "m", "cm", "box", "pack", "dozen",
]);

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(200, "Product name cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  SKU: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .transform((val) => val.toUpperCase())
    .optional(),
  barcode: z.string().trim().optional(),
  category: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase())
    .optional(),
  price: z.number().min(0, "Price cannot be negative"),
  costPrice: z.number().min(0, "Cost price cannot be negative").optional(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),
  minStock: z
    .number()
    .int("Minimum stock must be an integer")
    .min(0, "Minimum stock cannot be negative")
    .optional(),
  unit: productUnitEnum.optional(),
  image: z.string().trim().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.costPrice !== undefined && data.costPrice > data.price) {
      return false;
    }
    return true;
  },
  { message: "Cost price cannot exceed selling price", path: ["costPrice"] },
);

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(200, "Product name cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  SKU: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .transform((val) => val.toUpperCase())
    .optional(),
  barcode: z.string().trim().optional(),
  category: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase())
    .optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  costPrice: z.number().min(0, "Cost price cannot be negative").optional(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),
  minStock: z
    .number()
    .int("Minimum stock must be an integer")
    .min(0, "Minimum stock cannot be negative")
    .optional(),
  unit: productUnitEnum.optional(),
  image: z.string().trim().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (
      data.costPrice !== undefined &&
      data.price !== undefined &&
      data.costPrice > data.price
    ) {
      return false;
    }
    return true;
  },
  { message: "Cost price cannot exceed selling price", path: ["costPrice"] },
);

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase())
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  lowStock: z.enum(["true", "false"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});
