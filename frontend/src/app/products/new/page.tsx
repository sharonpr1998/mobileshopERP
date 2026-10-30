
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { apiRequest } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

interface CreateProductResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    brand: "",
    categoryId: "",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: "0",
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await apiRequest<CategoriesResponse>(
          "/categories",
        );

        setCategories(
          Array.isArray(result.data) ? result.data : [],
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load categories.",
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    void loadCategories();
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "sku" ? value.toUpperCase() : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        brand: form.brand.trim(),
        categoryId: form.categoryId,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        stockQuantity: Number(form.stockQuantity),
      };

      const result = await apiRequest<CreateProductResponse>(
        "/products",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (!result.success) {
        throw new Error(result.message || "Product creation failed.");
      }

      setSuccess("Product created successfully!");

      setTimeout(() => {
        router.push("/products");
      }, 800);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create product.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Products
          </Link>

          <div className="mb-6 mt-4">
            <h1 className="text-3xl font-bold text-slate-900">
              Add Product
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Add a mobile phone or accessory to your inventory.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. iPhone 16"
                  minLength={2}
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label htmlFor="sku" className="text-sm font-semibold text-slate-700">
                  SKU
                </label>
                <input
                  id="sku"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. IPHONE-16-128"
                  pattern="[A-Z0-9-]+"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="text-sm font-semibold text-slate-700">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Apple"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={loadingCategories || categories.length === 0}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : categories.length === 0
                        ? "No categories available"
                        : "Select category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="purchasePrice" className="text-sm font-semibold text-slate-700">
                  Purchase Price (₹)
                </label>
                <input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="sellingPrice" className="text-sm font-semibold text-slate-700">
                  Selling Price (₹)
                </label>
                <input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="stockQuantity" className="text-sm font-semibold text-slate-700">
                  Initial Stock Quantity
                </label>
                <input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  className={inputClass}
                  min="0"
                  step="1"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Enter the number of units currently available.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/products"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || loadingCategories || categories.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving Product..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
