import Purchase from "@/models/purchase.model.js";
class PurchaseRepository {
    async create(data, session) {
        const [purchase] = await Purchase.create([data], { session });
        return purchase;
    }
    async findAll(page, limit) {
        const [purchases, total] = await Promise.all([
            Purchase.find()
                .populate("items.productId", "name sku brand")
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Purchase.countDocuments(),
        ]);
        return {
            purchases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
export default new PurchaseRepository();
