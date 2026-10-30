import mongoose, { Schema } from "mongoose";
const roleSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("Role", roleSchema);
