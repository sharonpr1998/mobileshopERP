
import mongoose, { Schema, type Document } from "mongoose";

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface IPurchase extends Document {
  supplierName: string;
  invoiceNumber: string;
  items: IPurchaseItem[];
  totalAmount: number;
  createdBy: mongoose.Types.ObjectId;
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const purchaseSchema = new Schema<IPurchase>(
  {
    supplierName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: (items: IPurchaseItem[]) => items.length > 0,
        message: "Purchase must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

purchaseSchema.index({ invoiceNumber: 1 }, { unique: true });

export default mongoose.model<IPurchase>("Purchase", purchaseSchema);
