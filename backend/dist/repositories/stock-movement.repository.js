import StockMovement from "../models/stock-movement.model.js";
class StockMovementRepository {
    async create(data, session) {
        const [movement] = await StockMovement.create([data], {
            session,
        });
        return movement;
    }
    async findByProductId(productId) {
        return StockMovement.find({ productId })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
    }
}
export default new StockMovementRepository();
