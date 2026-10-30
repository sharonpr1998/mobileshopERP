import Product from "@/models/product.model.js";
class ProductRepository {
    async create(data) {
        return Product.create(data);
    }
    async findAll(options) {
        const { search, categoryId, page, limit } = options;
        const filter = {
            isActive: true,
        };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
            ];
        }
        if (categoryId) {
            filter.categoryId = categoryId;
        }
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("categoryId", "name")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments(filter),
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findBySku(sku, excludeId) {
        const filter = {
            sku: sku.trim().toUpperCase(),
        };
        if (excludeId) {
            filter._id = { $ne: excludeId };
        }
        return Product.findOne(filter);
    }
    async updateById(id, data) {
        return Product.findOneAndUpdate({ _id: id, isActive: true }, data, {
            new: true,
            runValidators: true,
        }).populate("categoryId", "name");
    }
    async softDelete(id) {
        return Product.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true });
    }
    async findByIdForUpdate(id, session) {
        return Product.findOne({
            _id: id,
            isActive: true,
        }).session(session);
    }
    async increaseStock(id, quantity, session) {
        return Product.findOneAndUpdate({ _id: id, isActive: true }, { $inc: { stockQuantity: quantity } }, {
            new: true,
            runValidators: true,
            session,
        });
    }
}
export default new ProductRepository();
