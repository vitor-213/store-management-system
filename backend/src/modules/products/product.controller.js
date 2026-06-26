import {
  createProductService,
  getProductsService,
  getProductService,
  updateProductService,
  deleteProductService,
  toggleProductStatusService,
} from "./product.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createProduct = asyncHandler(async (req, res) => {
  const product = await createProductService(req.body, req.user?._id);
  res.status(201).json({ success: true, data: product });
});

export const getProducts = asyncHandler(async (req, res) => {
  const result = await getProductsService(req.query);
  res.json({
    success: true,
    data: result.products || [],
    pagination: {
      page: result.page || 1,
      totalPages: result.totalPages || 1,
      total: result.total || 0,
      limit: result.limit || 20,
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductService(req.params.id);
  res.json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(
    req.params.id,
    req.body,
    req.user?._id,
  );
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await deleteProductService(req.params.id);
  res.json({ success: true, message: "Product deleted" });
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await toggleProductStatusService(req.params.id);
  res.json({ success: true, data: product });
});
