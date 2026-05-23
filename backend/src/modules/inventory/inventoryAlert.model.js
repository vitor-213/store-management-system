import mongoose from "mongoose";
import { ALERT_STATUSES } from "../../constants/inventoryTypes.js";

const inventoryAlertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },

    type: {
      type: String,
      default: "low_stock",
      enum: ["low_stock", "out_of_stock", "overstock"],
    },

    status: {
      type: String,
      enum: Object.values(ALERT_STATUSES),
      default: ALERT_STATUSES.ACTIVE,
      index: true,
    },

    currentStock: {
      type: Number,
      required: true,
    },

    minStock: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    acknowledgedAt: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

inventoryAlertSchema.index({ status: 1, createdAt: -1 });
inventoryAlertSchema.index({ product: 1, status: 1 });

const InventoryAlert = mongoose.model("InventoryAlert", inventoryAlertSchema);

export default InventoryAlert;
