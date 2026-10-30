import Sale from "../models/sale.model.js";
class SaleRepository {
    async create(data, session) {
        const [sale] = await Sale.create([data], { session });
        return sale;
    }
    async findAll() {
        return Sale.find()
            .populate("customerId", "name phone email address notes")
            .populate("items.productId", "name sku")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
    }
}
export default new SaleRepository();
