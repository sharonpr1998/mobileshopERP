import mongoose, { Schema } from "mongoose";
const permissionSchema = new Schema({
    moduleId: {
        type: Schema.Types.ObjectId,
        ref: "Module",
        required: true,
    },
    actionId: {
        type: Schema.Types.ObjectId,
        ref: "Action",
        required: true,
    },
    moduleTypeId: {
        type: Schema.Types.ObjectId,
        ref: "ModuleType",
        required: true,
    },
}, { timestamps: true });
permissionSchema.index({ moduleId: 1, actionId: 1, moduleTypeId: 1 }, { unique: true });
export default mongoose.model("Permission", permissionSchema);
