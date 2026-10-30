import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";
import Module from "@/models/module.model.js";
import Action from "@/models/action.model.js";
import ModuleType from "@/models/module-type.model.js";
import Permission from "@/models/permission.model.js";
import RolePermission from "@/models/role-permission.model.js";
export function authorize(moduleCode, actionCode, moduleTypeCode) {
    return async (_req, res, next) => {
        try {
            const userId = res.locals.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
                return;
            }
            const user = await User.findById(userId).select("roleId status");
            if (!user || user.status !== "active") {
                res.status(401).json({
                    success: false,
                    message: "User account is unavailable",
                });
                return;
            }
            const role = await Role.findById(user.roleId);
            if (!role) {
                res.status(403).json({
                    success: false,
                    message: "Role not configured",
                });
                return;
            }
            if (role.name === "super_admin") {
                next();
                return;
            }
            const [module, action, moduleType] = await Promise.all([
                Module.findOne({ code: moduleCode, isActive: true }),
                Action.findOne({ code: actionCode }),
                ModuleType.findOne({ code: moduleTypeCode }),
            ]);
            if (!module || !action || !moduleType) {
                res.status(403).json({
                    success: false,
                    message: "Permission configuration not found",
                });
                return;
            }
            const permission = await Permission.findOne({
                moduleId: module._id,
                actionId: action._id,
                moduleTypeId: moduleType._id,
            });
            if (!permission) {
                res.status(403).json({
                    success: false,
                    message: "Permission denied",
                });
                return;
            }
            const rolePermission = await RolePermission.exists({
                roleId: role._id,
                permissionId: permission._id,
            });
            if (!rolePermission) {
                res.status(403).json({
                    success: false,
                    message: "You do not have permission for this action",
                });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
