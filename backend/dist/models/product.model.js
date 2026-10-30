import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    stockQuantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Stock quantity must be a whole number",
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
productSchema.index({ name: 1, brand: 1 });
export default mongoose.model("Product", productSchema);
