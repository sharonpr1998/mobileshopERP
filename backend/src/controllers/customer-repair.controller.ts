import type { Request, Response, NextFunction } from "express";

import customerRepairService from "@/services/customer-repair.service.js";

class CustomerRepairController {
  async getMyRepairs(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = res.locals.userId as string;

      const repairs = await customerRepairService.getMyRepairs(userId);

      res.status(200).json({
        success: true,
        message: "Your repairs fetched successfully",
        data: repairs,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerRepairController();