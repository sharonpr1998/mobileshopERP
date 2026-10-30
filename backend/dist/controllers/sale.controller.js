import saleService from "../services/sale.service.js";
class SaleController {
    async create(req, res, next) {
        try {
            const sale = await saleService.createSale({
                ...req.body,
                createdBy: res.locals.userId,
            });
            res.status(201).json({
                success: true,
                message: "Sale completed successfully",
                data: sale,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(_req, res, next) {
        try {
            const sales = await saleService.getAllSales();
            res.status(200).json({
                success: true,
                data: sales,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new SaleController();
