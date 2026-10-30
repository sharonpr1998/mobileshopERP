"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { apiRequest } from "@/lib/api";

interface StockProduct {
  _id: string;
  name: string;
  sku: string;
  brand?: string;
  categoryId?: {
    _id: string;
    name: string;
  } | string;
  sellingPrice: number;
  stockQuantity: number;
}

interface ProductsResponse {
  success: boolean;
  message?: string;
  data: StockProduct[];
}

export default function StockPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStock() {
      try {
        const result =
          await apiRequest<ProductsResponse>("/products");

        if (cancelled) return;

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Unable to load stock products.",
          );
        }

        setProducts(result.data);
        setError("");
      } catch (err: unknown) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load stock products.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchStock();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");

    try {
      const result =
        await apiRequest<ProductsResponse>("/products");

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(
          result.message || "Unable to refresh stock.",
        );
      }

      setProducts(result.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh stock.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  const totalUnits = products.reduce(
    (total, product) => total + product.stockQuantity,
    0,
  );

  const lowStockProducts = products.filter(
    (product) => product.stockQuantity <= 5,
  );

  function getCategoryName(product: StockProduct) {
    if (
      typeof product.categoryId === "object" &&
      product.categoryId !== null
    ) {
      return product.categoryId.name;
    }

    return "Uncategorized";
  }

  function getStockStatus(quantity: number) {
    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-800",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className: "bg-amber-100 text-amber-800",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-100 text-green-800",
    };
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ← Back to Dashboard
              </Link>

              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                Stock Management
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Monitor inventory and low-stock products.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={loading || refreshing}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={refreshing}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">
                Total Stock Units
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : totalUnits.toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Total units available in inventory
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">
                Low Stock Products
              </p>

              <p className="mt-3 text-3xl font-bold text-orange-600">
                {loading ? "—" : lowStockProducts.length}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Products with 5 or fewer units
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Inventory List
              </h2>

              <span className="text-sm text-slate-600">
                {loading ? "Loading..." : `${products.length} products`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="px-4 py-4 font-semibold">#</th>
                    <th className="px-4 py-4 font-semibold">Product</th>
                    <th className="px-4 py-4 font-semibold">SKU</th>
                    <th className="px-4 py-4 font-semibold">Category</th>
                    <th className="px-4 py-4 font-semibold">Selling Price</th>
                    <th className="px-4 py-4 font-semibold">Stock</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-600"
                      >
                        Loading inventory...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-600"
                      >
                        No products found. Add a product first.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => {
                      const status = getStockStatus(
                        product.stockQuantity,
                      );

                      return (
                        <tr
                          key={product._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 text-slate-600">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {product.name}
                            </p>

                            {product.brand && (
                              <p className="mt-1 text-xs text-slate-600">
                                {product.brand}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {product.sku}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {getCategoryName(product)}
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-900">
                            {Number(product.sellingPrice).toLocaleString(
                              "en-IN",
                              {
                                style: "currency",
                                currency: "INR",
                                minimumFractionDigits: 2,
                              },
                            )}
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {product.stockQuantity}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
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
