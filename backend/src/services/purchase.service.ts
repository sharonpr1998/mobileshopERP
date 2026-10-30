
import mongoose from "mongoose";
import type { IPurchase, IPurchaseItem } from "@/models/purchase.model.js";
import purchaseRepository from "@/repositories/purchase.repository.js";
import productRepository from "@/repositories/product.repository.js";

interface PurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseData {
  supplierName: string;
  invoiceNumber: string;
  items: PurchaseItemInput[];
  createdBy: string;
}

class PurchaseService {
  async createPurchase(data: PurchaseData) {
    const supplierName = data.supplierName?.trim();
    const invoiceNumber = data.invoiceNumber?.trim();

    if (!supplierName) {
      throw new Error("Supplier name is required");
    }

    if (!invoiceNumber) {
      throw new Error("Invoice number is required");
    }

    if (!mongoose.isValidObjectId(data.createdBy)) {
      throw new Error("Invalid user ID");
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("At least one purchase item is required");
    }

    for (const item of data.items) {
      if (!mongoose.isValidObjectId(item.productId)) {
        throw new Error("Invalid product ID");
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error("Quantity must be a positive whole number");
      }

      if (!Number.isFinite(item.unitCost) || item.unitCost < 0) {
        throw new Error("Unit cost must be zero or greater");
      }
    }

    const session = await mongoose.startSession();

    try {
      let savedPurchase: IPurchase | undefined;

      await session.withTransaction(async () => {
        const items: IPurchaseItem[] = [];
        let totalAmount = 0;

        for (const item of data.items) {
          const product = await productRepository.findByIdForUpdate(
            item.productId,
            session,
          );

          if (!product) {
            throw new Error("Active product not found");
          }

          const lineTotal = item.quantity * item.unitCost;

          if (!Number.isFinite(lineTotal)) {
            throw new Error("Purchase amount is invalid");
          }

          const updatedProduct = await productRepository.increaseStock(
            item.productId,
            item.quantity,
            session,
          );

          if (!updatedProduct) {
            throw new Error(`Could not update stock for ${product.name}`);
          }

          updatedProduct.purchasePrice = item.unitCost;
          await updatedProduct.save({ session });

          items.push({
            productId: new mongoose.Types.ObjectId(item.productId),
            quantity: item.quantity,
            unitCost: item.unitCost,
            lineTotal,
          });

          totalAmount += lineTotal;
        }

        if (!Number.isFinite(totalAmount)) {
          throw new Error("Total purchase amount is invalid");
        }

        savedPurchase = await purchaseRepository.create(
          {
            supplierName,
            invoiceNumber,
            items,
            totalAmount,
            createdBy: data.createdBy,
          },
          session,
        );
      });

      if (!savedPurchase) {
        throw new Error("Purchase could not be saved");
      }

      return savedPurchase;
    } finally {
      await session.endSession();
    }
  }

  async getAllPurchases(page = 1, limit = 10) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    return purchaseRepository.findAll(safePage, safeLimit);
  }
}

export default new PurchaseService();
