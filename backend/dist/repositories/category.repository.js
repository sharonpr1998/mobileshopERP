import Category from "@/models/category.model.js";
class CategoryRepository {
    async create(data) {
        return Category.create(data);
    }
    async findAll() {
        return Category.find()
            .populate("parentCategoryId", "name")
            .sort({ name: 1 });
    }
    async findById(id) {
        return Category.findById(id);
    }
    async findByName(name, excludeId) {
        const filter = {
            name: { $regex: `^${name}$`, $options: "i" },
        };
        if (excludeId) {
            filter._id = { $ne: excludeId };
        }
        return Category.findOne(filter);
    }
    async update(id, data) {
        return Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    async hasSubcategories(id) {
        return Category.exists({ parentCategoryId: id });
    }
    async delete(id) {
        return Category.findByIdAndDelete(id);
    }
}
export default new CategoryRepository();
