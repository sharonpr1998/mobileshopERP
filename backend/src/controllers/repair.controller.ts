
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { RepairStatus } from "@/models/repair.model.js";
import repairService from "@/services/repair.service.js";
import smsService from "@/services/sms.service.js";

class RepairController {
  // Create Repair
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

  // Get All Repairs
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const status =
        typeof req.query.status === "string"
          ? (req.query.status as RepairStatus)
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

  // Update Repair Status
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

  // Test Twilio SMS
  async testSms(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { phone } = req.body as { phone?: string };

      if (
        typeof phone !== "string" ||
        !/^\+[1-9]\d{7,14}$/.test(phone)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Enter a valid phone number with country code. Example: +919876543210",
        });
        return;
      }

      const messageSid = await smsService.sendTestSms(phone);

      res.status(200).json({
        success: true,
        message: "Test SMS submitted successfully to Twilio.",
        data: {
          messageSid,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RepairController();
