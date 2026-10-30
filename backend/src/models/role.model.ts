
import mongoose, { Schema, type Document } from "mongoose";

export interface IRole extends Document {
  name: "super_admin" | "staff" | "customer";
  description?: string;
  isSystemRole: boolean;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ["super_admin", "staff", "customer"],
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSystemRole: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", roleSchema);
