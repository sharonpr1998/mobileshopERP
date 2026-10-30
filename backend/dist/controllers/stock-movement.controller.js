import stockMovementService from "../services/stock-movement.service.js";
class StockMovementController {
    async create(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
    async getHistory(req, res, next) {
        try {
            const history = await stockMovementService.getProductHistory(req.params.productId);
            res.status(200).json({
                success: true,
                data: history,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new StockMovementController();
