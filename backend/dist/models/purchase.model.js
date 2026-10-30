import mongoose, { Schema } from "mongoose";
const purchaseItemSchema = new Schema({
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
}, { _id: false });
const purchaseSchema = new Schema({
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
            validator: (items) => items.length > 0,
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
}, { timestamps: true });
purchaseSchema.index({ invoiceNumber: 1 }, { unique: true });
export default mongoose.model("Purchase", purchaseSchema);
