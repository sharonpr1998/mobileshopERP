import mongoose, { Schema, type Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  parentCategoryId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1, parentCategoryId: 1 });

export default mongoose.model<ICategory>("Category", categorySchema);