
import mongoose, { Schema, type Document } from "mongoose";

const saleItemSchema = new Schema(
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
    },
    unitPrice: {
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

export interface ISale extends Document {
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  invoiceNumber: string;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  totalAmount: number;
  createdBy: mongoose.Types.ObjectId;
}

const saleSchema = new Schema<ISale>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    customerName: {
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
      unique: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "Sale must contain at least one item",
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

export default mongoose.model<ISale>("Sale", saleSchema);
