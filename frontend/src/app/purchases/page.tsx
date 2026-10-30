
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Category {
  _id: string;
  name: string;
  isActive?: boolean;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  brand: string;
  categoryId: string | Category;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive?: boolean;
}

interface PurchaseItem {
  productId: Product | string;
  quantity: number;
  unitCost: number;
}

interface Purchase {
  _id: string;
  supplierName: string;
  invoiceNumber: string;
  items: PurchaseItem[];
  totalAmount: number;
  createdAt?: string;
}

interface ApiResult<T> {
  success?: boolean;
  message?: string;
  data: T;
}

type ProductMode = "existing" | "new";

const emptyNewProduct = {
  name: "",
  sku: "",
  brand: "",
  purchasePrice: "",
  sellingPrice: "",
};

function getCategoryId(categoryId: string | Category): string {
  return typeof categoryId === "string" ? categoryId : categoryId._id;
}

function PurchasesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [mode, setMode] = useState<ProductMode>("existing");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const [newProduct, setNewProduct] = useState(emptyNewProduct);
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const activeProducts = products.filter(
    (product) =>
      getCategoryId(product.categoryId) === selectedCategoryId &&
      product.isActive !== false,
  );

  const filteredProducts = activeProducts.filter((product) => {
    const search = productSearch.trim().toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search)
    );
  });

  const selectedProduct = products.find(
    (product) => product._id === selectedProductId,
  );

  const totalAmount =
    Number(quantity) > 0 &&
    quantity.trim() !== "" &&
    unitCost.trim() !== "" &&
    Number(unitCost) >= 0 &&
    Number.isFinite(Number(quantity)) &&
    Number.isFinite(Number(unitCost))
      ? Number(quantity) * Number(unitCost)
      : 0;

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const [categoryResult, productResult, purchaseResult] =
          await Promise.allSettled([
            apiRequest<ApiResult<Category[]>>(
              "/categories?page=1&limit=100",
            ),
            apiRequest<ApiResult<Product[]>>(
              "/products?page=1&limit=100",
            ),
            apiRequest<ApiResult<Purchase[]>>(
              "/v1/purchases?page=1&limit=10",
            ),
          ]);

        if (cancelled) return;

        const errors: string[] = [];

        if (categoryResult.status === "fulfilled") {
          setCategories(
            (Array.isArray(categoryResult.value.data)
              ? categoryResult.value.data
              : []
            ).filter((category) => category.isActive !== false),
          );
        } else {
          errors.push("Could not load categories.");
        }

        if (productResult.status === "fulfilled") {
          setProducts(
            Array.isArray(productResult.value.data)
              ? productResult.value.data
              : [],
          );
        } else {
          errors.push("Could not load products.");
        }

        if (purchaseResult.status === "fulfilled") {
          setPurchases(
            Array.isArray(purchaseResult.value.data)
              ? purchaseResult.value.data
              : [],
          );
        } else {
          errors.push("Could not load purchase history.");
        }

        setError(errors.join(" "));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load data.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function resetProductFields() {
    setSelectedProductId("");
    setProductSearch("");
    setNewProduct(emptyNewProduct);
    setQuantity("1");
    setUnitCost("");
  }

  function handleModeChange(nextMode: ProductMode) {
    setMode(nextMode);
    resetProductFields();
    setError("");
    setSuccess("");
  }

  function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId);
    resetProductFields();
    setError("");
    setSuccess("");
  }

  function handleExistingProductChange(productId: string) {
    const product = activeProducts.find(
      (entry) => entry._id === productId,
    );

    if (!product) return;

    setSelectedProductId(product._id);
    setProductSearch(`${product.name} (${product.sku})`);
    setUnitCost(String(product.purchasePrice));
    setError("");
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function getProductName(productId: Product | string) {
    if (typeof productId !== "string") return productId.name;

    return products.find((product) => product._id === productId)?.name
      ?? "Product";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!supplierName.trim() || !invoiceNumber.trim()) {
      setError("Enter the supplier name and invoice number.");
      return;
    }

    if (!selectedCategoryId) {
      setError("Please select a category.");
      return;
    }

    if (mode === "existing" && !selectedProductId) {
      setError("Please select an existing product.");
      return;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (
      unitCost.trim() === "" ||
      !Number.isFinite(Number(unitCost)) ||
      Number(unitCost) < 0
    ) {
      setError("Enter a valid purchase price.");
      return;
    }

    if (
      mode === "new" &&
      (!newProduct.name.trim() ||
        !newProduct.sku.trim() ||
        !newProduct.brand.trim() ||
        newProduct.purchasePrice.trim() === "" ||
        newProduct.sellingPrice.trim() === "" ||
        !Number.isFinite(Number(newProduct.purchasePrice)) ||
        !Number.isFinite(Number(newProduct.sellingPrice)) ||
        Number(newProduct.purchasePrice) < 0 ||
        Number(newProduct.sellingPrice) < 0)
    ) {
      setError("Please complete all new product fields with valid prices.");
      return;
    }

    setSaving(true);

    try {
      let productId = selectedProductId;

      // Step 1: Save a new product first.
      // It will appear on the Products page because it is saved in the database.
      if (mode === "new") {
        const productResult = await apiRequest<ApiResult<Product>>(
          "/products",
          {
            method: "POST",
            body: JSON.stringify({
              name: newProduct.name.trim(),
              sku: newProduct.sku.trim().toUpperCase(),
              brand: newProduct.brand.trim(),
              categoryId: selectedCategoryId,
              purchasePrice: Number(newProduct.purchasePrice),
              sellingPrice: Number(newProduct.sellingPrice),
              stockQuantity: 0,
            }),
          },
        );

        productId = productResult.data._id;

        if (!productId) {
          throw new Error("Product was created, but its ID was not returned.");
        }
      }

      // Step 2: Save the purchase.
      // The backend purchase service is responsible for increasing stock.
      await apiRequest("/v1/purchases", {
        method: "POST",
        body: JSON.stringify({
          supplierName: supplierName.trim(),
          invoiceNumber: invoiceNumber.trim(),
          items: [
            {
              productId,
              quantity: Number(quantity),
              unitCost: Number(unitCost),
            },
          ],
        }),
      });

      setSuccess(
        mode === "new"
          ? "Product created and purchase saved successfully."
          : "Purchase saved successfully.",
      );

      setSupplierName("");
      setInvoiceNumber("");
      setSelectedCategoryId("");
      setMode("existing");
      resetProductFields();

      // Reload products and purchase history.
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save purchase.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Purchases</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add products, record supplier purchases and update inventory.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              disabled={loading}
              className="rounded-lg border bg-white px-4 py-2.5 text-sm hover:bg-gray-100 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link
              href="/products"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              View Products
            </Link>
          </div>
        </header>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <section className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Create Purchase</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select an existing product or create a new one.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="supplierName" className="mb-2 block text-sm font-medium">
                  Supplier Name
                </label>
                <input
                  id="supplierName"
                  value={supplierName}
                  onChange={(event) => setSupplierName(event.target.value)}
                  required
                  placeholder="Enter supplier name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="invoiceNumber" className="mb-2 block text-sm font-medium">
                  Invoice Number
                </label>
                <input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  required
                  placeholder="Enter invoice number"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="mb-4 font-semibold">Product Details</h3>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategoryId}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                  >
                    <option value="">Choose a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleModeChange("existing")}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
                    mode === "existing"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  Select Existing Product
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("new")}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
                    mode === "new"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  + Add New Product
                </button>
              </div>

              {mode === "existing" ? (
                <div className="mt-5">
                  <label htmlFor="productSearch" className="mb-2 block text-sm font-medium">
                    Search Product
                  </label>
                  <input
                    id="productSearch"
                    value={productSearch}
                    onChange={(event) => {
                      setProductSearch(event.target.value);
                      setSelectedProductId("");
                      setUnitCost("");
                    }}
                    disabled={!selectedCategoryId || loading}
                    placeholder="Type product name or SKU"
                    autoComplete="off"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                  />

                  {selectedCategoryId && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border">
                      {filteredProducts.length ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => handleExistingProductChange(product._id)}
                            className={`flex w-full items-center justify-between gap-3 border-b px-3 py-3 text-left text-sm last:border-b-0 hover:bg-blue-50 ${
                              selectedProductId === product._id ? "bg-blue-50" : "bg-white"
                            }`}
                          >
                            <span>
                              <span className="block font-medium">{product.name}</span>
                              <span className="text-xs text-gray-500">
                                SKU: {product.sku}
                              </span>
                            </span>
                            <span className="text-xs text-gray-500">
                              Stock: {product.stockQuantity}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-sm text-gray-500">
                          No matching products. Choose “Add New Product” to create one.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="newName" className="mb-2 block text-sm font-medium">
                      Product Name
                    </label>
                    <input
                      id="newName"
                      value={newProduct.name}
                      onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })}
                      required
                      placeholder="e.g. OPPO A3"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="newSku" className="mb-2 block text-sm font-medium">
                      SKU
                    </label>
                    <input
                      id="newSku"
                      value={newProduct.sku}
                      onChange={(event) => setNewProduct({ ...newProduct, sku: event.target.value.toUpperCase() })}
                      required
                      placeholder="e.g. OPPO-A3-001"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="newBrand" className="mb-2 block text-sm font-medium">
                      Brand
                    </label>
                    <input
                      id="newBrand"
                      value={newProduct.brand}
                      onChange={(event) => setNewProduct({ ...newProduct, brand: event.target.value })}
                      required
                      placeholder="e.g. OPPO"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPurchasePrice" className="mb-2 block text-sm font-medium">
                      Purchase Price (₹)
                    </label>
                    <input
                      id="newPurchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.purchasePrice}
                      onChange={(event) => {
                        setNewProduct({ ...newProduct, purchasePrice: event.target.value });
                        setUnitCost(event.target.value);
                      }}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="newSellingPrice" className="mb-2 block text-sm font-medium">
                      Selling Price (₹)
                    </label>
                    <input
                      id="newSellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.sellingPrice}
                      onChange={(event) => setNewProduct({ ...newProduct, sellingPrice: event.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 border-t pt-5 md:grid-cols-2">
              <div>
                <label htmlFor="quantity" className="mb-2 block text-sm font-medium">
                  Purchase Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                />
              </div>

              <div>
                <label htmlFor="unitCost" className="mb-2 block text-sm font-medium">
                  Purchase Price per Unit (₹)
                </label>
                <input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitCost}
                  onChange={(event) => setUnitCost(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="mt-1 font-semibold">
                  {mode === "new"
                    ? "New product — stock starts at 0"
                    : selectedProduct
                      ? `${selectedProduct.stockQuantity} units`
                      : "Select a product"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purchase Total</p>
                <p className="mt-1 text-xl font-bold text-blue-700">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  !selectedCategoryId ||
                  (mode === "existing" && !selectedProductId)
                }
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving..." : "Save Purchase"}
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">Purchase History</h2>
            <p className="mt-1 text-sm text-gray-500">
              Recently recorded purchases.
            </p>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Loading purchase data...
            </p>
          ) : purchases.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              No purchases found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Supplier</th>
                    <th className="px-5 py-4">Products</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium">
                        {purchase.invoiceNumber}
                      </td>
                      <td className="px-5 py-4">{purchase.supplierName}</td>
                      <td className="px-5 py-4">
                        {purchase.items?.map((purchaseItem, index) => (
                          <span key={`${purchase._id}-${index}`}>
                            {index > 0 ? ", " : ""}
                            {getProductName(purchaseItem.productId)} × {purchaseItem.quantity}
                          </span>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatCurrency(purchase.totalAmount ?? 0)}
                      </td>
                      <td className="px-5 py-4">
                        {purchase.createdAt
                          ? new Date(purchase.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <ProtectedRoute>
      <PurchasesContent />
    </ProtectedRoute>
  );
}
