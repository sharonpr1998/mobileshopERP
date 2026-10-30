import mongoose, { Schema } from "mongoose";
const saleItemSchema = new Schema({
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
}, { _id: false });
const saleSchema = new Schema({
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
            validator: (items) => items.length > 0,
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
}, { timestamps: true });
export default mongoose.model("Sale", saleSchema);
