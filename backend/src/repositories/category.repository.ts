import Category from "@/models/category.model.js";

class CategoryRepository {
  async create(data: {
    name: string;
    description?: string;
    parentCategoryId?: string | null;
  }) {
    return Category.create(data);
  }

  async findAll() {
    return Category.find()
      .populate("parentCategoryId", "name")
      .sort({ name: 1 });
  }

  async findById(id: string) {
    return Category.findById(id);
  }

  async findByName(name: string, excludeId?: string) {
    const filter: Record<string, unknown> = {
      name: { $regex: `^${name}$`, $options: "i" },
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return Category.findOne(filter);
  }

  async update(
    id: string,
    data: { name: string; description?: string },
  ) {
    return Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async hasSubcategories(id: string) {
    return Category.exists({ parentCategoryId: id });
  }

  async delete(id: string) {
    return Category.findByIdAndDelete(id);
  }
}

export default new CategoryRepository();