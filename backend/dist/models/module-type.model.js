import mongoose, { Schema } from "mongoose";
const moduleTypeSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("ModuleType", moduleTypeSchema);
