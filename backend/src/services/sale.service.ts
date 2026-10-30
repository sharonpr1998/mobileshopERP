
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import Sale from "../models/sale.model.js";
import StockMovement from "../models/stock-movement.model.js";
import saleRepository from "../repositories/sale.repository.js";

interface CreateSaleInput {
  customerId?: string;
  customerName?: string;
  invoiceNumber: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  createdBy: string;
}

class SaleService {
  async createSale(data: CreateSaleInput) {
    const session = await mongoose.startSession();

    try {
      let sale;

      await session.withTransaction(async () => {
        const invoiceExists = await Sale.exists({
          invoiceNumber: data.invoiceNumber,
        }).session(session);

        if (invoiceExists) {
          throw new Error("Invoice number already exists");
        }

        let customerId: mongoose.Types.ObjectId | undefined;
        let customerName = data.customerName?.trim() ?? "";

        if (data.customerId) {
          if (!mongoose.isValidObjectId(data.customerId)) {
            throw new Error("Invalid customer ID");
          }

          const customer = await Customer.findOne({
            _id: data.customerId,
            isActive: true,
          }).session(session);

          if (!customer) {
            throw new Error("Customer not found or inactive");
          }

          customerId = customer._id;
          customerName = customer.name;
        }

        if (!customerName || customerName.length < 2) {
          throw new Error("Valid customer name is required");
        }

        const saleItems: {
          productId: mongoose.Types.ObjectId;
          quantity: number;
          unitPrice: number;
          lineTotal: number;
        }[] = [];

        let totalAmount = 0;

        // Validate products and calculate prices from the database.
        for (const item of data.items) {
          if (!mongoose.isValidObjectId(item.productId)) {
            throw new Error("Invalid product ID");
          }

          const product = await Product.findById(item.productId)
            .session(session);

          if (!product || !product.isActive) {
            throw new Error("Product not found or inactive");
          }

          const unitPrice = product.sellingPrice;
          const lineTotal = unitPrice * item.quantity;

          saleItems.push({
            productId: product._id,
            quantity: item.quantity,
            unitPrice,
            lineTotal,
          });

          totalAmount += lineTotal;
        }

        // Decrease stock and record previous stock.
        const stockChanges: {
          productId: mongoose.Types.ObjectId;
          quantity: number;
          previousStock: number;
          newStock: number;
        }[] = [];

        for (const item of saleItems) {
          const product = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              isActive: true,
              stockQuantity: { $gte: item.quantity },
            },
            {
              $inc: { stockQuantity: -item.quantity },
            },
            {
              new: false,
              session,
            },
          );

          if (!product) {
            throw new Error(
              "Insufficient stock or product unavailable",
            );
          }

          stockChanges.push({
            productId: product._id,
            quantity: item.quantity,
            previousStock: product.stockQuantity,
            newStock: product.stockQuantity - item.quantity,
          });
        }

        sale = await saleRepository.create(
          {
            ...(customerId ? { customerId } : {}),
            customerName,
            invoiceNumber: data.invoiceNumber,
            items: saleItems,
            totalAmount,
            createdBy: new mongoose.Types.ObjectId(data.createdBy),
          },
          session,
        );

        for (const change of stockChanges) {
          await StockMovement.create(
            [
              {
                productId: change.productId,
                type: "out",
                quantity: change.quantity,
                previousStock: change.previousStock,
                newStock: change.newStock,
                reason: `Sale invoice ${data.invoiceNumber}`,
                createdBy: new mongoose.Types.ObjectId(data.createdBy),
              },
            ],
            { session },
          );
        }
      });

      return sale;
    } finally {
      await session.endSession();
    }
  }

  async getAllSales() {
    return saleRepository.findAll();
  }
}

export default new SaleService();
