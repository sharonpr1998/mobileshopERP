
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";
import attendanceService from "@/services/attendance.service.js";

class AttendanceController {
  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Selfie image is required",
        });
        return;
      }

      const attendance = await attendanceService.checkIn(
        res.locals.userId,
        req.body.location,
        req.file.buffer,
      );

      res.status(201).json({
        success: true,
        message: "Check-in successful",
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Selfie image is required",
        });
        return;
      }

      const attendance = await attendanceService.checkOut(
        res.locals.userId,
        req.body.location,
        req.file.buffer,
      );

      res.status(200).json({
        success: true,
        message: "Check-out successful",
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  // Staff: Own attendance history
  async getMyAttendance(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const attendance = await attendanceService.getMyAttendance(
        res.locals.userId,
      );

      res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  // Super Admin: All staff attendance
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await User.findById(res.locals.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const role = await Role.findById(user.roleId);

      if (role?.name !== "super_admin") {
        res.status(403).json({
          success: false,
          message: "Only Super Admin can view all attendance",
        });
        return;
      }

      const attendance = await attendanceService.getAllAttendance();

      res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
