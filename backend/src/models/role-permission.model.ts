
import mongoose, { Schema, type Document } from "mongoose";

export interface IRolePermission extends Document {
  roleId: mongoose.Types.ObjectId;
  permissionId: mongoose.Types.ObjectId;
}

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
  },
  { timestamps: true }
);

rolePermissionSchema.index(
  { roleId: 1, permissionId: 1 },
  { unique: true }
);

export default mongoose.model<IRolePermission>(
  "RolePermission",
  rolePermissionSchema
);
