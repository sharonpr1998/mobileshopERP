import type { Request, Response } from "express";
import rbacService from "@/services/rbac.service.js";

type AsyncHandler = (
  req: Request,
  res: Response,
) => Promise<unknown>;

function handle(fn: AsyncHandler) {
  return async (req: Request, res: Response) => {
    try {
      const data = await fn(req, res);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      const status =
        message.includes("not found") ? 404 :
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
  updateRole: handle((req) =>
    rbacService.updateRole(req.params.id! as string, req.body),
  ),
  deleteRole: handle((req) =>
    rbacService.deleteRole(req.params.id! as string),
  ),

  // Modules
  getModules: handle(() => rbacService.getModules()),
  createModule: handle((req) => rbacService.createModule(req.body)),
  updateModule: handle((req) =>
    rbacService.updateModule(req.params.id! as string, req.body),
  ),
  deleteModule: handle((req) =>
    rbacService.deleteModule(req.params.id! as string),
  ),

  // Module types
  getModuleTypes: handle(() => rbacService.getModuleTypes()),
  createModuleType: handle((req) =>
    rbacService.createModuleType(req.body),
  ),
  updateModuleType: handle((req) =>
    rbacService.updateModuleType(req.params.id! as string, req.body),
  ),
  deleteModuleType: handle((req) =>
    rbacService.deleteModuleType(req.params.id! as string),
  ),

  // Actions
  getActions: handle(() => rbacService.getActions()),
  createAction: handle((req) => rbacService.createAction(req.body)),
  updateAction: handle((req) =>
    rbacService.updateAction(req.params.id! as string, req.body),
  ),
  deleteAction: handle((req) =>
    rbacService.deleteAction(req.params.id! as string),
  ),

  // Permissions
  getPermissions: handle(() => rbacService.getPermissions()),
  createPermission: handle((req) =>
    rbacService.createPermission(req.body),
  ),
  deletePermission: handle((req) =>
    rbacService.deletePermission(req.params.id! as string),
  ),

  // Assign permissions to roles
  getRolePermissions: handle((req) =>
    rbacService.getRolePermissions(req.params.roleId! as string),
  ),
  setRolePermissions: handle((req) =>
    rbacService.setRolePermissions(
      req.params.roleId! as string,
      req.body.permissionIds,
    ),
  ),
};

export default rbacController;