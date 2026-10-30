import rbacService from "@/services/rbac.service.js";
function handle(fn) {
    return async (req, res) => {
        try {
            const data = await fn(req, res);
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            const status = message.includes("not found") ? 404 :
                message.includes("already exists") ? 409 :
                    message.includes("Cannot ") ? 403 :
                        400;
            res.status(status).json({
                success: false,
                message,
            });
        }
    };
}
const rbacController = {
    // Roles
    getRoles: handle(() => rbacService.getRoles()),
    createRole: handle((req) => rbacService.createRole(req.body)),
    updateRole: handle((req) => rbacService.updateRole(req.params.id, req.body)),
    deleteRole: handle((req) => rbacService.deleteRole(req.params.id)),
    // Modules
    getModules: handle(() => rbacService.getModules()),
    createModule: handle((req) => rbacService.createModule(req.body)),
    updateModule: handle((req) => rbacService.updateModule(req.params.id, req.body)),
    deleteModule: handle((req) => rbacService.deleteModule(req.params.id)),
    // Module types
    getModuleTypes: handle(() => rbacService.getModuleTypes()),
    createModuleType: handle((req) => rbacService.createModuleType(req.body)),
    updateModuleType: handle((req) => rbacService.updateModuleType(req.params.id, req.body)),
    deleteModuleType: handle((req) => rbacService.deleteModuleType(req.params.id)),
    // Actions
    getActions: handle(() => rbacService.getActions()),
    createAction: handle((req) => rbacService.createAction(req.body)),
    updateAction: handle((req) => rbacService.updateAction(req.params.id, req.body)),
    deleteAction: handle((req) => rbacService.deleteAction(req.params.id)),
    // Permissions
    getPermissions: handle(() => rbacService.getPermissions()),
    createPermission: handle((req) => rbacService.createPermission(req.body)),
    deletePermission: handle((req) => rbacService.deletePermission(req.params.id)),
    // Assign permissions to roles
    getRolePermissions: handle((req) => rbacService.getRolePermissions(req.params.roleId)),
    setRolePermissions: handle((req) => rbacService.setRolePermissions(req.params.roleId, req.body.permissionIds)),
};
export default rbacController;
