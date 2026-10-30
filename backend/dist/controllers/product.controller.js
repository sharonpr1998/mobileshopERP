import productService from "@/services/product.service.js";
class ProductController {
    async create(req, res, next) {
        try {
            const product = await productService.createProduct(req.body);
            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const result = await productService.getAllProducts({
                search: typeof req.query.search === "string"
                    ? req.query.search
                    : undefined,
                categoryId: typeof req.query.categoryId === "string"
                    ? req.query.categoryId
                    : undefined,
                page: typeof req.query.page === "string"
                    ? Number(req.query.page)
                    : undefined,
                limit: typeof req.query.limit === "string"
                    ? Number(req.query.limit)
                    : undefined,
            });
            res.status(200).json({
                success: true,
                data: result.products,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await productService.deleteProduct(req.params.id);
            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new ProductController();
