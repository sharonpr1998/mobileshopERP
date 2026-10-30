import mongoose from "mongoose";
import Role from "@/models/role.model.js";
import Module from "@/models/module.model.js";
import ModuleType from "@/models/module-type.model.js";
import Action from "@/models/action.model.js";
import Permission from "@/models/permission.model.js";
import RolePermission from "@/models/role-permission.model.js";
class RbacService {
    // ROLES
    async getRoles() {
        return Role.find().sort({ name: 1 });
    }
    async createRole(data) {
        const exists = await Role.findOne({ name: data.name });
        if (exists) {
            throw new Error("Role already exists");
        }
        return Role.create({
            ...data,
            isSystemRole: data.isSystemRole ?? false,
        });
    }
    async updateRole(id, data) {
        const role = await Role.findById(id);
        if (!role) {
            throw new Error("Role not found");
        }
        if (role.isSystemRole && data.name && data.name !== role.name) {
            throw new Error("Cannot rename a system role");
        }
        if (data.isSystemRole !== undefined) {
            throw new Error("System role status cannot be changed");
        }
        if (data.name && data.name !== role.name) {
            const exists = await Role.findOne({ name: data.name });
            if (exists) {
                throw new Error("Role already exists");
            }
        }
        Object.assign(role, data);
        await role.save();
        return role;
    }
    async deleteRole(id) {
        const role = await Role.findById(id);
        if (!role) {
            throw new Error("Role not found");
        }
        if (role.isSystemRole) {
            throw new Error("Cannot delete a system role");
        }
        await RolePermission.deleteMany({ roleId: id });
        await role.deleteOne();
        return role;
    }
    // MODULES
    async getModules() {
        return Module.find().sort({ name: 1 });
    }
    async createModule(data) {
        return Module.create(data);
    }
    async updateModule(id, data) {
        const result = await Module.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!result) {
            throw new Error("Module not found");
        }
        return result;
    }
    async deleteModule(id) {
        const module = await Module.findById(id);
        if (!module) {
            throw new Error("Module not found");
        }
        const isUsed = await Permission.exists({ moduleId: id });
        if (isUsed) {
            throw new Error("Cannot delete a module that is used by permissions");
        }
        await module.deleteOne();
        return module;
    }
    // MODULE TYPES
    async getModuleTypes() {
        return ModuleType.find().sort({ name: 1 });
    }
    async createModuleType(data) {
        return ModuleType.create(data);
    }
    async updateModuleType(id, data) {
        const result = await ModuleType.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!result) {
            throw new Error("Module type not found");
        }
        return result;
    }
    async deleteModuleType(id) {
        const moduleType = await ModuleType.findById(id);
        if (!moduleType) {
            throw new Error("Module type not found");
        }
        const isUsed = await Permission.exists({ moduleTypeId: id });
        if (isUsed) {
            throw new Error("Cannot delete a module type that is used by permissions");
        }
        await moduleType.deleteOne();
        return moduleType;
    }
    // ACTIONS
    async getActions() {
        return Action.find().sort({ name: 1 });
    }
    async createAction(data) {
        return Action.create(data);
    }
    async updateAction(id, data) {
        const result = await Action.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!result) {
            throw new Error("Action not found");
        }
        return result;
    }
    async deleteAction(id) {
        const action = await Action.findById(id);
        if (!action) {
            throw new Error("Action not found");
        }
        const isUsed = await Permission.exists({ actionId: id });
        if (isUsed) {
            throw new Error("Cannot delete an action that is used by permissions");
        }
        await action.deleteOne();
        return action;
    }
    // PERMISSIONS
    async getPermissions() {
        return Permission.find()
            .populate("moduleId", "name code")
            .populate("actionId", "name code")
            .populate("moduleTypeId", "name code")
            .sort({ createdAt: -1 });
    }
    async createPermission(data) {
        const [module, action, moduleType] = await Promise.all([
            Module.findById(data.moduleId),
            Action.findById(data.actionId),
            ModuleType.findById(data.moduleTypeId),
        ]);
        if (!module || !action || !moduleType) {
            throw new Error("Invalid module, action, or module type ID");
        }
        const exists = await Permission.findOne({
            moduleId: data.moduleId,
            actionId: data.actionId,
            moduleTypeId: data.moduleTypeId,
        });
        if (exists) {
            throw new Error("Permission already exists");
        }
        return Permission.create(data);
    }
    async deletePermission(id) {
        const permission = await Permission.findById(id);
        if (!permission) {
            throw new Error("Permission not found");
        }
        await RolePermission.deleteMany({ permissionId: permission._id });
        await permission.deleteOne();
        return permission;
    }
    // ROLE PERMISSIONS
    async getRolePermissions(roleId) {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error("Role not found");
        }
        const assignments = await RolePermission.find({ roleId })
            .populate({
            path: "permissionId",
            populate: [
                { path: "moduleId", select: "name code" },
                { path: "actionId", select: "name code" },
                { path: "moduleTypeId", select: "name code" },
            ],
        });
        return {
            role,
            permissions: assignments,
        };
    }
    async setRolePermissions(roleId, permissionIds) {
        const session = await mongoose.startSession();
        try {
            let result;
            await session.withTransaction(async () => {
                const role = await Role.findById(roleId).session(session);
                if (!role) {
                    throw new Error("Role not found");
                }
                const uniqueIds = [...new Set(permissionIds)];
                const validCount = await Permission.countDocuments({
                    _id: { $in: uniqueIds },
                }).session(session);
                if (validCount !== uniqueIds.length) {
                    throw new Error("One or more permission IDs are invalid");
                }
                await RolePermission.deleteMany({ roleId }).session(session);
                if (uniqueIds.length > 0) {
                    await RolePermission.insertMany(uniqueIds.map((permissionId) => ({
                        roleId: role._id,
                        permissionId: new mongoose.Types.ObjectId(permissionId),
                    })), { session });
                }
                const assignments = await RolePermission.find({ roleId })
                    .session(session)
                    .populate({
                    path: "permissionId",
                    populate: [
                        { path: "moduleId", select: "name code" },
                        { path: "actionId", select: "name code" },
                        { path: "moduleTypeId", select: "name code" },
                    ],
                });
                result = {
                    role,
                    permissions: assignments,
                };
            });
            if (!result) {
                throw new Error("Failed to update role permissions");
            }
            return result;
        }
        finally {
            await session.endSession();
        }
    }
}
export default new RbacService();
