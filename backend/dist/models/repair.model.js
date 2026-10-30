import mongoose, { Schema } from "mongoose";
const repairSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    deviceBrand: {
        type: String,
        required: true,
        trim: true,
    },
    deviceModel: {
        type: String,
        required: true,
        trim: true,
    },
    imei: {
        type: String,
        trim: true,
    },
    issue: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    estimatedCost: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: [
            "received",
            "in_progress",
            "ready",
            "delivered",
            "cancelled",
        ],
        default: "received",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
repairSchema.index({ customerId: 1, createdAt: -1 });
repairSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model("Repair", repairSchema);
