import { Router } from "express";
import Joi from "joi";
import rbacController from "@/controllers/rbac.controller.js";
import requireRbacAdmin from "@/middlewares/require-rbac-admin.middleware.js";
import { roleSchema, masterSchema, permissionSchema, rolePermissionsSchema, validateBody, validateId, validateRoleId, } from "@/validators/rbac.validation.js";
const router = Router();
// All RBAC management routes require super admin access.
router.use(requireRbacAdmin);
// Role update validation
const roleUpdateSchema = roleSchema
    .fork(["name"], (field) => field.optional())
    .min(1);
// Module update validation
const moduleUpdateSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    code: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9_-]+$/),
    isActive: Joi.boolean(),
}).min(1);
// Module type and action update validation
const masterUpdateSchema = masterSchema
    .fork(["name", "code"], (field) => field.optional())
    .min(1);
// ROLES
router.get("/roles", rbacController.getRoles);
router.post("/roles", validateBody(roleSchema), rbacController.createRole);
router.patch("/roles/:id", validateId, validateBody(roleUpdateSchema), rbacController.updateRole);
router.delete("/roles/:id", validateId, rbacController.deleteRole);
// MODULES
router.get("/modules", rbacController.getModules);
router.post("/modules", validateBody(masterSchema), rbacController.createModule);
router.patch("/modules/:id", validateId, validateBody(moduleUpdateSchema), rbacController.updateModule);
router.delete("/modules/:id", validateId, rbacController.deleteModule);
// MODULE TYPES
router.get("/module-types", rbacController.getModuleTypes);
router.post("/module-types", validateBody(masterSchema), rbacController.createModuleType);
router.patch("/module-types/:id", validateId, validateBody(masterUpdateSchema), rbacController.updateModuleType);
router.delete("/module-types/:id", validateId, rbacController.deleteModuleType);
// ACTIONS
router.get("/actions", rbacController.getActions);
router.post("/actions", validateBody(masterSchema), rbacController.createAction);
router.patch("/actions/:id", validateId, validateBody(masterUpdateSchema), rbacController.updateAction);
router.delete("/actions/:id", validateId, rbacController.deleteAction);
// PERMISSIONS
router.get("/permissions", rbacController.getPermissions);
router.post("/permissions", validateBody(permissionSchema), rbacController.createPermission);
router.delete("/permissions/:id", validateId, rbacController.deletePermission);
// ROLE-PERMISSION ASSIGNMENT
router.get("/roles/:roleId/permissions", validateRoleId, rbacController.getRolePermissions);
router.put("/roles/:roleId/permissions", validateRoleId, validateBody(rolePermissionsSchema), rbacController.setRolePermissions);
export default router;
