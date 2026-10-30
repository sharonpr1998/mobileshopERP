
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import { apiRequest } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  isActive?: boolean;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  sku?: string;
  brand?: string;
  categoryId?: string | {
    _id?: string;
    id?: string;
    name?: string;
  };
  purchasePrice?: number;
  sellingPrice?: number;
  stockQuantity?: number;
}

interface Pagination {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ProductsResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination?: Pagination;
}

interface CategoriesResponse {
  success: boolean;
  message?: string;
  data: Category[];
}

interface ProductResponse {
  success: boolean;
  message?: string;
  data?: Product;
}

interface ProductForm {
  name: string;
  sku: string;
  brand: string;
  categoryId: string;
  purchasePrice: string;
  sellingPrice: string;
  stockQuantity: string;
}

const PAGE_SIZE = 10;

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  brand: "",
  categoryId: "",
  purchasePrice: "",
  sellingPrice: "",
  stockQuantity: "0",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const result = await apiRequest<ProductsResponse>(
          `/products?${params.toString()}`,
        );

        if (cancelled) return;

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Unable to load products.",
          );
        }

        setProducts(result.data);

        setPagination(
          result.pagination ?? {
            page,
            limit: PAGE_SIZE,
            total: result.data.length,
            totalPages: 1,
          },
        );

        setError("");
      } catch (err: unknown) {
        if (cancelled) return;

        setProducts([]);
        setPagination({
          page,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
        });

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [page, search, refreshCount]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const result = await apiRequest<CategoriesResponse>(
          "/categories",
        );

        if (cancelled) return;

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Unable to load categories.",
          );
        }

        setCategories(
          result.data.filter(
            (category) => category.isActive !== false,
          ),
        );

        setCategoryError("");
      } catch (err: unknown) {
        if (!cancelled) {
          setCategoryError(
            err instanceof Error
              ? err.message
              : "Unable to load categories.",
          );
        }
      }
    }

    void fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleRefresh() {
    setRefreshCount((count) => count + 1);
  }

  function handlePageChange(nextPage: number) {
    const totalPages = Math.max(
      1,
      pagination.totalPages ?? 1,
    );

    if (loading || nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
  }

  function getProductId(product: Product) {
    return product._id ?? product.id ?? "";
  }

  function getCategoryId(product: Product) {
    if (typeof product.categoryId === "object") {
      return (
        product.categoryId?._id ??
        product.categoryId?.id ??
        ""
      );
    }

    return product.categoryId ?? "";
  }

  function getCategoryName(product: Product) {
    if (typeof product.categoryId === "object") {
      return product.categoryId?.name ?? "—";
    }

    const category = categories.find(
      (item) =>
        (item._id ?? item.id) === product.categoryId,
    );

    return category?.name ?? "—";
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku ?? "",
      brand: product.brand ?? "",
      categoryId: getCategoryId(product),
      purchasePrice: String(product.purchasePrice ?? 0),
      sellingPrice: String(product.sellingPrice ?? 0),
      stockQuantity: String(product.stockQuantity ?? 0),
    });

    setFormError("");
  }

  function closeEditModal() {
    if (saving) return;

    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  }

  function handleFormChange(
    field: keyof ProductForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingProduct) return;

    const id = getProductId(editingProduct);

    if (!id) {
      setFormError("Product ID is missing.");
      return;
    }

    const purchasePrice = Number(form.purchasePrice);
    const sellingPrice = Number(form.sellingPrice);
    const stockQuantity = Number(form.stockQuantity);

    if (
      !Number.isFinite(purchasePrice) ||
      !Number.isFinite(sellingPrice) ||
      !Number.isInteger(stockQuantity) ||
      purchasePrice < 0 ||
      sellingPrice < 0 ||
      stockQuantity < 0
    ) {
      setFormError(
        "Enter valid prices and a whole-number stock quantity.",
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const result = await apiRequest<ProductResponse>(
        `/products/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.trim(),
            sku: form.sku.trim().toUpperCase(),
            brand: form.brand.trim(),
            categoryId: form.categoryId,
            purchasePrice,
            sellingPrice,
            stockQuantity,
          }),
        },
      );

      if (!result.success) {
        throw new Error(
          result.message || "Unable to update product.",
        );
      }

      setEditingProduct(null);
      setForm(emptyForm);
      setRefreshCount((count) => count + 1);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to update product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const id = getProductId(product);

    if (!id) {
      window.alert("Product ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      const result = await apiRequest<{
        success: boolean;
        message?: string;
      }>(`/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!result.success) {
        throw new Error(
          result.message || "Unable to delete product.",
        );
      }

      // If the last product on this page is deleted,
      // move back one page when possible.
      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setRefreshCount((count) => count + 1);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product.",
      );
    } finally {
      setDeletingId("");
    }
  }

  const currentPage = pagination.page ?? page;
  const totalPages = Math.max(
    1,
    pagination.totalPages ?? 1,
  );

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ← Back to Dashboard
              </Link>

              <h1 className="text-3xl font-bold text-slate-900">
                Products
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage your mobile phones and accessories.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                href="/products/new"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add Product
              </Link>
            </div>
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <form
              onSubmit={handleSearch}
              className="mb-6 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by product name or SKU..."
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Search
              </button>
            </form>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p className="font-semibold">
                  Product operation failed
                </p>
                <p className="mt-1">{error}</p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Try Again
                </button>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Product List
              </h2>

              <span className="text-sm text-slate-500">
                {pagination.total ?? products.length} products
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">SKU</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Purchase Price</th>
                    <th className="px-4 py-3 font-semibold">Selling Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 && !error ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No products found. Click Add Product to create one.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const id = getProductId(product);

                      return (
                        <tr
                          key={id || product.sku || product.name}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {product.brand ?? "—"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {product.sku ?? "—"}
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {getCategoryName(product)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            ₹{(product.purchasePrice ?? 0).toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-900">
                            ₹{(product.sellingPrice ?? 0).toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                (product.stockQuantity ?? 0) <= 5
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {product.stockQuantity ?? 0}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(product)}
                                disabled={Boolean(deletingId)}
                                className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleDelete(product)}
                                disabled={!id || Boolean(deletingId)}
                                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingId === id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={loading || currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={loading || currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>

        {editingProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeEditModal();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-product-title"
              className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="edit-product-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Edit Product
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update the product details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  aria-label="Close edit form"
                  className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              {categoryError && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  {categoryError}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Product Name
                    </label>
                    <input
                      id="edit-name"
                      required
                      maxLength={150}
                      value={form.name}
                      onChange={(event) =>
                        handleFormChange("name", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-sku"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      SKU
                    </label>
                    <input
                      id="edit-sku"
                      required
                      value={form.sku}
                      onChange={(event) =>
                        handleFormChange("sku", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-brand"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Brand
                    </label>
                    <input
                      id="edit-brand"
                      required
                      value={form.brand}
                      onChange={(event) =>
                        handleFormChange("brand", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-category"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Category
                    </label>
                    <select
                      id="edit-category"
                      required
                      value={form.categoryId}
                      onChange={(event) =>
                        handleFormChange("categoryId", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => {
                        const id = category._id ?? category.id ?? "";

                        return (
                          <option key={id} value={id}>
                            {category.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-purchase-price"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Purchase Price (₹)
                    </label>
                    <input
                      id="edit-purchase-price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.purchasePrice}
                      onChange={(event) =>
                        handleFormChange("purchasePrice", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-selling-price"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Selling Price (₹)
                    </label>
                    <input
                      id="edit-selling-price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.sellingPrice}
                      onChange={(event) =>
                        handleFormChange("sellingPrice", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="edit-stock"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Stock Quantity
                    </label>
                    <input
                      id="edit-stock"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.stockQuantity}
                      onChange={(event) =>
                        handleFormChange("stockQuantity", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Update Product"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
