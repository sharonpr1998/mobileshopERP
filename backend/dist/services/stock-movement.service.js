import mongoose from "mongoose";
import Product from "../models/product.model.js";
import stockMovementRepository from "../repositories/stock-movement.repository.js";
class StockMovementService {
    async createMovement(data) {
        const session = await mongoose.startSession();
        try {
            let movement;
            await session.withTransaction(async () => {
                const product = await Product.findOneAndUpdate({
                    _id: data.productId,
                    ...(data.type === "out"
                        ? { stockQuantity: { $gte: data.quantity } }
                        : {}),
                }, {
                    $inc: {
                        stockQuantity: data.type === "in"
                            ? data.quantity
                            : -data.quantity,
                    },
                }, {
                    new: false,
                    session,
                });
                if (!product) {
                    const exists = await Product.exists({
                        _id: data.productId,
                    }).session(session);
                    if (!exists) {
                        throw new Error("Product not found");
                    }
                    throw new Error("Insufficient stock");
                }
                const previousStock = product.stockQuantity;
                const newStock = data.type === "in"
                    ? previousStock + data.quantity
                    : previousStock - data.quantity;
                movement = await stockMovementRepository.create({
                    productId: product._id,
                    type: data.type,
                    quantity: data.quantity,
                    previousStock,
                    newStock,
                    reason: data.reason,
                    createdBy: new mongoose.Types.ObjectId(data.createdBy),
                }, session);
            });
            return movement;
        }
        finally {
            await session.endSession();
        }
    }
    async getProductHistory(productId) {
        if (!mongoose.isValidObjectId(productId)) {
            throw new Error("Invalid product ID");
        }
        return stockMovementRepository.findByProductId(productId);
    }
}
export default new StockMovementService();
