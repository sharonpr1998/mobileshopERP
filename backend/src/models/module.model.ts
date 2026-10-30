
import mongoose, { Schema, type Document } from "mongoose";

export interface IModule extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

const moduleSchema = new Schema<IModule>(
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
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IModule>("Module", moduleSchema);
