
import mongoose, { Schema, type Document } from "mongoose";

export interface IPermission extends Document {
  moduleId: mongoose.Types.ObjectId;
  actionId: mongoose.Types.ObjectId;
  moduleTypeId: mongoose.Types.ObjectId;
}

const permissionSchema = new Schema<IPermission>(
  {
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
  },
  { timestamps: true }
);

permissionSchema.index(
  { moduleId: 1, actionId: 1, moduleTypeId: 1 },
  { unique: true }
);

export default mongoose.model<IPermission>(
  "Permission",
  permissionSchema
);
