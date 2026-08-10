import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    unit: {
      type: String,
      required: true,
      enum: [
        "Piece",
        "Box",
        "Pack",
        "Kg",
        "Gram",
        "Liter",
        "Meter",
        "Roll",
        "Set",
      ],
    },

    description: {
      type: String,
      default: "",
    },

    minimumStockLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;