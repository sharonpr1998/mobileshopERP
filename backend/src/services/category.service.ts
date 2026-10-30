import mongoose from "mongoose";
import categoryRepository from "@/repositories/category.repository.js";

class CategoryService {
  async createCategory(data: {
    name: string;
    description?: string;
    parentCategoryId?: string | null;
  }) {
    const name = data.name.trim();

    if (name.length < 2 || name.length > 100) {
      throw new Error("Category name must be between 2 and 100 characters");
    }

    const existing = await categoryRepository.findByName(name);

    if (existing) {
      throw new Error("Category already exists");
    }

    if (data.parentCategoryId) {
      if (!mongoose.isValidObjectId(data.parentCategoryId)) {
        throw new Error("Invalid parent category ID");
      }

      const parent = await categoryRepository.findById(
        data.parentCategoryId,
      );

      if (!parent) {
        throw new Error("Parent category not found");
      }

      if (parent.parentCategoryId) {
        throw new Error("Only one subcategory level is allowed");
      }
    }

    return categoryRepository.create({ ...data, name });
  }

  async getAllCategories() {
    return categoryRepository.findAll();
  }

  async updateCategory(
    id: string,
    data: { name: string; description?: string },
  ) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid category ID");
    }

    const name = data.name.trim();

    if (name.length < 2 || name.length > 100) {
      throw new Error("Category name must be between 2 and 100 characters");
    }

    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    const existing = await categoryRepository.findByName(name, id);

    if (existing) {
      throw new Error("Another category with this name already exists");
    }

    return categoryRepository.update(id, { ...data, name });
  }

  async deleteCategory(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid category ID");
    }

    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    const hasSubcategories = await categoryRepository.hasSubcategories(id);

    if (hasSubcategories) {
      throw new Error(
        "Cannot delete this category because it has subcategories",
      );
    }

    return categoryRepository.delete(id);
  }
}

export default new CategoryService();