import StockMovement from "../models/stock-movement.model.js";
import type mongoose from "mongoose";

class StockMovementRepository {
  async create(
    data: {
      productId: mongoose.Types.ObjectId;
      type: "in" | "out";
      quantity: number;
      previousStock: number;
      newStock: number;
      reason: string;
      createdBy: mongoose.Types.ObjectId;
    },
    session: mongoose.ClientSession,
  ) {
    const [movement] = await StockMovement.create([data], {
      session,
    });

    return movement;
  }

  async findByProductId(productId: string) {
    return StockMovement.find({ productId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  }
}

export default new StockMovementRepository();