
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    const result = await apiRequest<ApiResponse<Category[]>>("/categories");

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message || "Unable to load categories.");
    }

    setCategories(result.data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        await loadCategories();
        if (!cancelled) setError("");
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load categories.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [loadCategories]);

  async function handleRefresh() {
    setLoading(true);
    setError("");

    try {
      await loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Refresh failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const categoryName = name.trim();

    if (categoryName.length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest<ApiResponse<Category>>("/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName }),
      });

      if (!result.success) {
        throw new Error(result.message || "Could not create category.");
      }

      setName("");
      await loadCategories();
      setSuccess(result.message || "Category created successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category._id);
    setEditName(category.name);
    setError("");
    setSuccess("");
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    const categoryName = editName.trim();

    if (categoryName.length < 2 || categoryName.length > 100) {
      setError("Category name must contain 2 to 100 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiRequest<ApiResponse<Category>>(
        `/categories/${editingId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name: categoryName }),
        },
      );

      if (!result.success) {
        throw new Error(result.message || "Could not update category.");
      }

      setEditingId(null);
      setEditName("");
      await loadCategories();
      setSuccess(result.message || "Category updated successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const result = await apiRequest<ApiResponse<null>>(
        `/categories/${category._id}`,
        { method: "DELETE" },
      );

      if (!result.success) {
        throw new Error(result.message || "Could not delete category.");
      }

      if (editingId === category._id) {
        setEditingId(null);
        setEditName("");
      }

      await loadCategories();
      setSuccess(result.message || "Category deleted successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <div className="mb-8 mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Categories
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Organize your mobile phones and accessories.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={loading || saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Add New Category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Examples: Mobile Phones, Chargers, Headphones.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter category name"
                minLength={2}
                maxLength={100}
                required
                className={inputClass}
              />

              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Category"}
              </button>
            </form>
          </section>

          {editingId && (
            <section className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Category
              </h2>

              <form
                onSubmit={handleUpdate}
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  autoFocus
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  className={inputClass}
                  placeholder="Category name"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditingId(null);
                    setEditName("");
                    setError("");
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Category List
              </h2>
              <span className="text-sm text-slate-500">
                {categories.length} categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Category Name</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                        Loading categories...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                        No categories found. Add your first category above.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category._id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-900">
                          {category.name}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.isActive === false
                                ? "bg-slate-100 text-slate-600"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {category.isActive === false ? "Inactive" : "Active"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => startEdit(category)}
                              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void handleDelete(category)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
