
import mongoose, { Schema, type Document } from "mongoose";

export interface IModuleType extends Document {
  name: string;
  code: string;
}

const moduleTypeSchema = new Schema<IModuleType>(
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
  },
  { timestamps: true }
);

export default mongoose.model<IModuleType>(
  "ModuleType",
  moduleTypeSchema
);
