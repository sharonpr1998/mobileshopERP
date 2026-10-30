import mongoose, { Schema } from "mongoose";
const actionSchema = new Schema({
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
export default mongoose.model("Action", actionSchema);
