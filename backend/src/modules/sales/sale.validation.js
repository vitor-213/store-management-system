import { z } from "zod";

const paymentMethods = ["cash", "card", "transfer", "mixed"];
const saleStatuses = ["completed", "cancelled", "refunded"];

const saleItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
});

export const createSaleSchema = z
  .object({
    customer: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID")
      .optional(),
    customerInfo: z
      .object({
        name: z.string().trim().min(1, "Customer name is required").optional(),
        email: z.string().trim().email("Invalid email").optional(),
        phone: z.string().trim().optional(),
        address: z.string().trim().optional(),
      })
      .optional(),
    items: z.array(saleItemSchema).min(1, "At least one item is required"),
    discount: z.number().min(0, "Discount cannot be negative").default(0),
    tax: z.number().min(0, "Tax cannot be negative").default(0),
    paymentMethod: z.enum(paymentMethods, {
      errorMap: () => ({ message: "Invalid payment method" }),
    }),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => {
      // Si no hay customer, debe haber customerInfo
      if (!data.customer && !data.customerInfo?.name) {
        return false;
      }
      return true;
    },
    {
      message: "Either customer ID or customer name is required",
      path: ["customer"],
    },
  );

export const updateSaleSchema = z
  .object({
    customer: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID")
      .optional(),
    customerInfo: z
      .object({
        name: z.string().trim().optional(),
        email: z.string().trim().email("Invalid email").optional(),
        phone: z.string().trim().optional(),
        address: z.string().trim().optional(),
      })
      .optional(),
    paymentMethod: z.enum(paymentMethods).optional(),
    paymentStatus: z
      .enum(["pending", "paid", "partially_paid", "refunded"])
      .optional(),
    status: z.enum(saleStatuses).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const cancelSaleSchema = z.object({
  reason: z.string().trim().min(1, "Cancellation reason is required").max(500),
});

export const saleQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(saleStatuses).optional(),
  paymentMethod: z.enum(paymentMethods).optional(),
  paymentStatus: z
    .enum(["pending", "paid", "partially_paid", "refunded"])
    .optional(),
  customer: z.string().optional(),
  createdBy: z.string().optional(),
  minTotal: z.string().optional(),
  maxTotal: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export const saleIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid sale ID"),
});
