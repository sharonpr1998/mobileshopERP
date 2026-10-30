
import type { ClientSession } from "mongoose";
import Purchase, {
  type IPurchaseItem,
} from "@/models/purchase.model.js";

interface CreatePurchaseData {
  supplierName: string;
  invoiceNumber: string;
  items: IPurchaseItem[];
  totalAmount: number;
  createdBy: string;
}

class PurchaseRepository {
  async create(data: CreatePurchaseData, session: ClientSession) {
    const [purchase] = await Purchase.create([data], { session });
    return purchase;
  }

  async findAll(page: number, limit: number) {
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
