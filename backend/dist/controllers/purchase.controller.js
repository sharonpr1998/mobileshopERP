import purchaseService from "@/services/purchase.service.js";
class PurchaseController {
    async create(req, res, next) {
        try {
            const createdBy = res.locals.userId;
            if (!createdBy) {
                res.status(401).json({
                    success: false,
                    message: "Authenticated user not found",
                });
                return;
            }
            const purchase = await purchaseService.createPurchase({
                ...req.body,
                createdBy,
            });
            res.status(201).json({
                success: true,
                message: "Purchase created successfully",
                data: purchase,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await purchaseService.getAllPurchases(page, limit);
            res.status(200).json({
                success: true,
                message: "Purchases fetched successfully",
                data: result.purchases,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new PurchaseController();
