import mongoose, { Schema } from "mongoose";
const stockMovementSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    type: {
        type: String,
        enum: ["in", "out", "adjustment"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    previousStock: {
        type: Number,
        required: true,
        min: 0,
    },
    newStock: {
        type: Number,
        required: true,
        min: 0,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
stockMovementSchema.index({ productId: 1, createdAt: -1 });
export default mongoose.model("StockMovement", stockMovementSchema);
