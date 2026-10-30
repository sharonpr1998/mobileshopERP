
import mongoose, { Schema, type Document } from "mongoose";

export interface IAction extends Document {
  name: string;
  code: string;
}

const actionSchema = new Schema<IAction>(
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

export default mongoose.model<IAction>("Action", actionSchema);
