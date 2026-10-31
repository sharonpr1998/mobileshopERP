
import mongoose, { Schema, type Document } from "mongoose";

export interface ICustomer extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}

const customerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ name: 1, phone: 1 });

export default mongoose.model<ICustomer>(
  "Customer",
  customerSchema
);
