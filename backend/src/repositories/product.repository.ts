import Product from "@/models/product.model.js";

interface ProductData {
  name: string;
  sku: string;
  brand: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
}

class ProductRepository {
  async create(data: ProductData) {
    return Product.create(data);
  }

  async findAll(options: {
    search?: string;
    categoryId?: string;
    page: number;
    limit: number;
  }) {
    const { search, categoryId, page, limit } = options;

    const filter: Record<string, unknown> = {
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

  async findBySku(sku: string, excludeId?: string) {
    const filter: Record<string, unknown> = {
      sku: sku.trim().toUpperCase(),
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return Product.findOne(filter);
  }

  async updateById(id: string, data: ProductData) {
    return Product.findOneAndUpdate({ _id: id, isActive: true }, data, {
      new: true,
      runValidators: true,
    }).populate("categoryId", "name");
  }

  async softDelete(id: string) {
    return Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );
  }

  async findByIdForUpdate(
    id: string,
    session: import("mongoose").ClientSession,
  ) {
    return Product.findOne({
      _id: id,
      isActive: true,
    }).session(session);
  }
  async increaseStock(
    id: string,
    quantity: number,
    session: import("mongoose").ClientSession,
  ) {
    return Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { $inc: { stockQuantity: quantity } },
      {
        new: true,
        runValidators: true,
        session,
      },
    );
  }
}

export default new ProductRepository();
