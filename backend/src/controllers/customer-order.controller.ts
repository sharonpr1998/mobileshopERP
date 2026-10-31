import type { Request, Response, NextFunction } from "express";

import customerOrderService from "@/services/customer-order.service.js";

class CustomerOrderController {
  async getMyOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = res.locals.userId as string;

      const orders = await customerOrderService.getMyOrders(userId);

      res.status(200).json({
        success: true,
        message: "Your orders fetched successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerOrderController();