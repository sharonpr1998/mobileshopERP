import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { RepairStatus } from "@/models/repair.model.js";
import repairService from "@/services/repair.service.js";

class RepairController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const repair = await repairService.createRepair(
        req.body,
        res.locals.userId,
      );

      res.status(201).json({
        success: true,
        message: "Repair job created successfully",
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const status =
        typeof req.query.status === "string"
          ? req.query.status as RepairStatus
          : undefined;

      const repairs = await repairService.getAllRepairs(status);

      res.status(200).json({
        success: true,
        data: repairs,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const repair = await repairService.updateRepairStatus(
        req.params.id as string,
        req.body.status,
      );

      res.status(200).json({
        success: true,
        message: "Repair status updated successfully",
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RepairController();