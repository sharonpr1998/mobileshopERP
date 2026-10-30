import mongoose from "mongoose";
import productRepository from "@/repositories/product.repository.js";
import categoryRepository from "@/repositories/category.repository.js";
class ProductService {
    async createProduct(data) {
        const category = await categoryRepository.findById(data.categoryId);
        if (!category || !category.isActive) {
            throw new Error("Active category not found");
        }
        const existingProduct = await productRepository.findBySku(data.sku);
        if (existingProduct) {
            throw new Error("SKU already exists");
        }
        return productRepository.create(data);
    }
    async getAllProducts(query) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(1, query.limit ?? 10));
        if (query.categoryId &&
            !mongoose.isValidObjectId(query.categoryId)) {
            throw new Error("Invalid category ID");
        }
        return productRepository.findAll({
            search: query.search?.trim(),
            categoryId: query.categoryId,
            page,
            limit,
        });
    }
    async updateProduct(id, data) {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error("Invalid product ID");
        }
        const category = await categoryRepository.findById(data.categoryId);
        if (!category || !category.isActive) {
            throw new Error("Active category not found");
        }
        const existingProduct = await productRepository.findBySku(data.sku, id);
        if (existingProduct) {
            throw new Error("SKU already exists");
        }
        const updatedProduct = await productRepository.updateById(id, data);
        if (!updatedProduct) {
            throw new Error("Product not found");
        }
        return updatedProduct;
    }
    async deleteProduct(id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error("Invalid product ID");
        }
        const deletedProduct = await productRepository.softDelete(id);
        if (!deletedProduct) {
            throw new Error("Product not found");
        }
        return deletedProduct;
    }
}
export default new ProductService();
