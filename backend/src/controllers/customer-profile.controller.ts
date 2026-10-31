import type { Request, Response, NextFunction } from "express";

import customerProfileService from "@/services/customer-profile.service.js";

class CustomerProfileController {
  async getMyProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = res.locals.userId as string;

      const profile = await customerProfileService.getMyProfile(userId);

      res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = res.locals.userId as string;

      const profile = await customerProfileService.updateMyProfile(
        userId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerProfileController();