import {
  findAllProducts,
  findProductById,
  findProductBySKU,
  createProduct,
  updateProductById,
  deleteProductById,
} from "./product.repository.js";
import { generateSKU } from "../../utils/generateSKU.js";
import ApiError from "../../utils/ApiError.js";

export const getProductsService = async (query = {}) => {
  try {
    const filter = {};
    const options = {};

    // Búsqueda por texto
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Filtro por categoría
    if (query.category) {
      filter.category = query.category.toLowerCase();
    }

    // Filtro por estado activo
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === "true";
    }

    // Filtro de bajo stock (solo si existe minStock)
    if (query.lowStock === "true") {
      // Usamos una consulta simple en lugar de $expr para evitar errores
      filter.stock = { $lte: 5 };
    }

    // Rango de precios
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }

    // Paginación
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    options.skip = skip;
    options.limit = limit;
    options.sort = { createdAt: -1 };

    // Ordenamiento
    if (query.sort) {
      const [field, order] = query.sort.split(":");
      if (field) {
        options.sort = { [field]: order === "desc" ? -1 : 1 };
      }
    }

    const result = await findAllProducts(filter, options);
    return result;
  } catch (error) {
    console.error("❌ Error en getProductsService:", error);
    throw error;
  }
};

export const getProductService = async (id) => {
  try {
    const product = await findProductById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return product;
  } catch (error) {
    console.error("❌ Error en getProductService:", error);
    throw error;
  }
};

export const createProductService = async (data, performedBy = null) => {
  try {
    // Generar SKU si no viene
    if (!data.SKU) {
      data.SKU = await generateSKU({
        category: data.category,
        name: data.name,
        includeCategory: true,
        includeName: true,
      });
    } else {
      data.SKU = data.SKU.toUpperCase();
    }

    // Verificar SKU duplicado
    const existing = await findProductBySKU(data.SKU);
    if (existing) {
      throw new ApiError(409, "Product with this SKU already exists");
    }

    const product = await createProduct(data);
    return product;
  } catch (error) {
    console.error("❌ Error en createProductService:", error);
    throw error;
  }
};

export const updateProductService = async (id, data, performedBy = null) => {
  try {
    const product = await findProductById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Verificar SKU duplicado
    if (data.SKU) {
      data.SKU = data.SKU.toUpperCase();
      const existing = await findProductBySKU(data.SKU);
      if (existing && existing._id.toString() !== id) {
        throw new ApiError(409, "Product with this SKU already exists");
      }
    }

    const updated = await updateProductById(id, data);
    return updated;
  } catch (error) {
    console.error("❌ Error en updateProductService:", error);
    throw error;
  }
};

export const deleteProductService = async (id) => {
  try {
    const product = await deleteProductById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return product;
  } catch (error) {
    console.error("❌ Error en deleteProductService:", error);
    throw error;
  }
};

export const toggleProductStatusService = async (id) => {
  try {
    const product = await findProductById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return await updateProductById(id, { isActive: !product.isActive });
  } catch (error) {
    console.error("❌ Error en toggleProductStatusService:", error);
    throw error;
  }
};
