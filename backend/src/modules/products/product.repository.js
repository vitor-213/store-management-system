import Product from "./product.model.js";

export const findAllProducts = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { products, total, page: Math.floor(skip / limit) + 1, totalPages: Math.ceil(total / limit) };
};

export const findProductById = async (id) => {
  return await Product.findById(id);
};

export const findProductBySKU = async (SKU) => {
  return await Product.findOne({ SKU: SKU.toUpperCase() });
};

export const createProduct = async (data) => {
  return await Product.create(data);
};

export const updateProductById = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteProductById = async (id) => {
  return await Product.findByIdAndDelete(id);
};
