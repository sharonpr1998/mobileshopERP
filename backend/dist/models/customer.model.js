import mongoose, { Schema } from "mongoose";
const customerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    address: {
        type: String,
        trim: true,
        maxlength: 300,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
customerSchema.index({ name: 1, phone: 1 });
export default mongoose.model("Customer", customerSchema);
