
import type { Request, Response, NextFunction } from "express";

import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";
import dashboardService from "@/services/dashboard.service.js";

class DashboardController {
  async getDashboard(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = res.locals.userId;

      const user = await User.findById(userId).select("roleId status");

      if (!user || user.status !== "active") {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const role = await Role.findById(user.roleId).select("name");

      if (role?.name !== "super_admin") {
        res.status(403).json({
          success: false,
          message: "Only Super Admin can access dashboard statistics",
        });
        return;
      }

      const dashboard = await dashboardService.getDashboardData();

      res.status(200).json({
        success: true,
        message: "Dashboard data fetched successfully",
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
