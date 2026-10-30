import type {
  Request,
  Response,
  NextFunction,
} from "express";

import stockMovementService from "../services/stock-movement.service.js";

class StockMovementController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const movement = await stockMovementService.createMovement({
        ...req.body,
        createdBy: res.locals.userId,
      });

      res.status(201).json({
        success: true,
        message: "Stock movement recorded successfully",
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }

async getHistory(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const history =
      await stockMovementService.getProductHistory(
        req.params.productId,
      );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}
}

export default new StockMovementController();