import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    roleId: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive", "blocked"],
        default: "active",
    },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
