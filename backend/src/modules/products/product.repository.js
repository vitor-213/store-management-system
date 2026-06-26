import Product from "./product.model.js";

export const findAllProducts = async (filter = {}, options = {}) => {
  try {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("❌ Error en findAllProducts:", error);
    throw error;
  }
};

export const findProductById = async (id) => {
  try {
    return await Product.findById(id).lean();
  } catch (error) {
    console.error("❌ Error en findProductById:", error);
    throw error;
  }
};

export const findProductBySKU = async (SKU) => {
  try {
    return await Product.findOne({ SKU: SKU.toUpperCase() }).lean();
  } catch (error) {
    console.error("❌ Error en findProductBySKU:", error);
    throw error;
  }
};

export const createProduct = async (data) => {
  try {
    return await Product.create(data);
  } catch (error) {
    console.error("❌ Error en createProduct:", error);
    throw error;
  }
};

export const updateProductById = async (id, updateData) => {
  try {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  } catch (error) {
    console.error("❌ Error en updateProductById:", error);
    throw error;
  }
};

export const deleteProductById = async (id) => {
  try {
    return await Product.findByIdAndDelete(id).lean();
  } catch (error) {
    console.error("❌ Error en deleteProductById:", error);
    throw error;
  }
};
