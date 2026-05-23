import { generateSKU } from "../../utils/generateSKU.js";
import {
  findAllProducts,
  findProductById,
  findProductBySKU,
  createProduct,
  updateProductById,
  deleteProductById,
} from "./product.repository.js";
import { adjustStock } from "../inventory/inventory.service.js";
import { MOVEMENT_TYPES } from "../../constants/inventoryTypes.js";
import { parsePaginationAndSort } from "../../utils/pagination.js";
import ApiError from "../../utils/ApiError.js";

export const createProductService = async (data, performedBy = null) => {
  if (data.SKU) {
    const existing = await findProductBySKU(data.SKU);
    if (existing) {
      throw new ApiError(409, "Product with this SKU already exists");
    }
    data.SKU = data.SKU.toUpperCase();
  } else {
    data.SKU = await generateSKU({
      category: data.category,
      name: data.name,
      includeCategory: true,
      includeName: true,
      checkUnique: async (sku) => !(await findProductBySKU(sku)),
    });
  }

  const initialStock = data.stock || 0;
  data.stock = 0;

  const product = await createProduct(data);

  if (initialStock > 0 && performedBy) {
    await adjustStock({
      productId: product._id,
      type: MOVEMENT_TYPES.INITIAL,
      quantity: initialStock,
      unitCost: data.costPrice || 0,
      performedBy,
      notes: "Initial stock on product creation",
    });
  }

  return await findProductById(product._id);
};

export const getProductsService = async (query = {}) => {
  const filter = {};
  const options = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.category) {
    filter.category = query.category.toLowerCase();
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.lowStock === "true") {
    filter.$expr = { $lte: ["$stock", "$minStock"] };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  const { skip, limit, sort } = parsePaginationAndSort(query, {
    page: 1,
    limit: 20,
    maxLimit: 100,
    defaultSort: { createdAt: -1 },
  });
  options.skip = skip;
  options.limit = limit;
  options.sort = sort;

  return await findAllProducts(filter, options);
};

export const getProductService = async (id) => {
  const product = await findProductById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const updateProductService = async (id, data, performedBy = null) => {
  const product = await findProductById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (data.SKU) {
    const existing = await findProductBySKU(data.SKU);
    if (existing && existing._id.toString() !== id) {
      throw new Error("Product with this SKU already exists");
    }
    data.SKU = data.SKU.toUpperCase();
  }

  if (data.stock !== undefined && performedBy) {
    const newStock = data.stock;
    delete data.stock;

    await adjustStock({
      productId: id,
      type: MOVEMENT_TYPES.ADJUSTMENT,
      quantity: newStock,
      unitCost: data.costPrice || product.costPrice || 0,
      reason: "set",
      notes: data.stockReason || "Manual stock adjustment",
      performedBy,
    });
  }

  const updated = await updateProductById(id, data);
  return updated;
};

export const deleteProductService = async (id) => {
  const product = await deleteProductById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const toggleProductStatusService = async (id) => {
  const product = await findProductById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return await updateProductById(id, { isActive: !product.isActive });
};
