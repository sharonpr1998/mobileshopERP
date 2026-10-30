import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
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
}, { timestamps: true });
categorySchema.index({ name: 1, parentCategoryId: 1 });
export default mongoose.model("Category", categorySchema);
