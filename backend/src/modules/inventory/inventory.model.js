import mongoose from "mongoose";
import { MOVEMENT_TYPES, MOVEMENT_DIRECTIONS, MOVEMENT_DIRECTION_MAP } from "../../constants/inventoryTypes.js";

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },

    type: {
      type: String,
      required: [true, "Movement type is required"],
      enum: Object.values(MOVEMENT_TYPES),
    },

    direction: {
      type: String,
      required: [true, "Direction is required"],
      enum: Object.values(MOVEMENT_DIRECTIONS),
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.001, "Quantity must be greater than 0"],
    },

    stockBefore: {
      type: Number,
      required: true,
    },

    stockAfter: {
      type: Number,
      required: true,
    },

    unitCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    reference: {
      type: String,
      trim: true,
    },

    referenceModel: {
      type: String,
      trim: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performed by is required"],
    },
  },
  {
    timestamps: true,
  },
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });
stockMovementSchema.index({ reference: 1, referenceModel: 1 });
stockMovementSchema.index({ performedBy: 1, createdAt: -1 });
stockMovementSchema.index({ createdAt: -1 });

stockMovementSchema.pre("validate", function (next) {
  if (MOVEMENT_DIRECTION_MAP[this.type] !== null) {
    this.direction = MOVEMENT_DIRECTION_MAP[this.type];
  }
  next();
});

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;
