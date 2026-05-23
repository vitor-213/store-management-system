import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    SKU: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
      default: 0,
    },

    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    minStock: {
      type: Number,
      default: 0,
      min: [0, "Minimum stock cannot be negative"],
    },

    unit: {
      type: String,
      enum: ["pcs", "kg", "g", "l", "ml", "m", "cm", "box", "pack", "dozen"],
      default: "pcs",
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: "text", description: "text" });

productSchema.virtual("profitMargin").get(function () {
  if (this.price && this.costPrice !== undefined) {
    return this.price > 0
      ? parseFloat((((this.price - this.costPrice) / this.price) * 100).toFixed(2))
      : null;
  }
  return null;
});

productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.minStock;
});

const Product = mongoose.model("Product", productSchema);

export default Product;
