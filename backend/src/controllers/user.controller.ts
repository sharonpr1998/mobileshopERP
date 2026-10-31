
import type { RequestHandler } from "express";
import userService from "@/services/user.service.js";

class UserController {
  // Create Staff
  createStaff: RequestHandler = async (req, res, next) => {
    try {
      const staff = await userService.createStaff(req.body);

      res.status(201).json({
        success: true,
        message: "Staff created successfully",
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get All Staff
  getAllStaff: RequestHandler = async (_req, res, next) => {
    try {
      const staff = await userService.getAllStaff();

      res.status(200).json({
        success: true,
        message: "Staff retrieved successfully",
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  };

  // Update Staff
  updateStaff: RequestHandler = async (req, res, next) => {
    try {
      const staff = await userService.updateStaff(
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Staff updated successfully",
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  };

  // Activate / Deactivate Staff
  updateStaffStatus: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { status } = req.body;

      const staff = await userService.updateStaffStatus(
        req.params.id as string,
        status
      );

      res.status(200).json({
        success: true,
        message: `Staff ${status} successfully`,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
