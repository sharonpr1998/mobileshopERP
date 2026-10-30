
import Sale from "../models/sale.model.js";
import type mongoose from "mongoose";

interface CreateSaleData {
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  invoiceNumber: string;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  totalAmount: number;
  createdBy: mongoose.Types.ObjectId;
}

class SaleRepository {
  async create(
    data: CreateSaleData,
    session: mongoose.ClientSession,
  ) {
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
