import type {
  Request,
  Response,
  NextFunction,
} from "express";

import customerService from "@/services/customer.service.js";

class CustomerController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const customer = await customerService.createCustomer(
        req.body,
      );

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
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
      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : undefined;

      const customers =
        await customerService.getAllCustomers(search);

      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();