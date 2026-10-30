import categoryService from "@/services/category.service.js";
class CategoryController {
    async create(req, res, next) {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(_req, res, next) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await categoryService.deleteCategory(req.params.id);
            res.status(200).json({
                success: true,
                message: "Category deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new CategoryController();
