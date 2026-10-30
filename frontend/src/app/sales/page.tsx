
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  sellingPrice: number;
  stockQuantity: number;
}

interface SaleItem {
  productId: string | Product;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerId?: string | Customer | null;
  items: SaleItem[];
  totalAmount: number;
  createdAt?: string;
}

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface ProductRow {
  productId: string;
  quantity: number;
}

const emptyCustomerForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function unwrapData<T>(response: unknown): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }

  return response as T;
}

function getList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    const result = value as Record<string, unknown>;

    for (const key of ["products", "customers", "sales", "items"]) {
      if (Array.isArray(result[key])) {
        return result[key] as T[];
      }
    }

    if (result.data !== undefined) {
      return getList<T>(result.data);
    }
  }

  return [];
}

function formatPrice(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getProductName(productId: string | Product): string {
  return typeof productId === "object"
    ? productId.name
    : "Product";
}

export default function SalesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] =
    useState<CustomerForm>(emptyCustomerForm);

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [productRows, setProductRows] = useState<ProductRow[]>([
    { productId: "", quantity: 1 },
  ]);

  const [loading, setLoading] = useState(true);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [productResponse, customerResponse, saleResponse] =
        await Promise.all([
          apiRequest<unknown>("/products?page=1&limit=100"),
          apiRequest<unknown>("/customers"),
          apiRequest<unknown>("/sales"),
        ]);

      setProducts(getList<Product>(unwrapData(productResponse)));
      setCustomers(getList<Customer>(unwrapData(customerResponse)));
      setSales(getList<Sale>(unwrapData(saleResponse)));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load sales data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const selectedCustomer = customers.find(
    (customer) => customer._id === selectedCustomerId,
  );

  const totalAmount = productRows.reduce((total, row) => {
    const product = products.find(
      (item) => item._id === row.productId,
    );

    return total + (product ? product.sellingPrice * row.quantity : 0);
  }, 0);

  // Reset the form after a successful sale.
  function resetSaleForm() {
    setSelectedCustomerId("");
    setShowCustomerForm(false);
    setCustomerForm({ ...emptyCustomerForm });
    setInvoiceNumber("");
    setProductRows([{ productId: "", quantity: 1 }]);
  }

  function updateCustomerForm(
    field: keyof CustomerForm,
    value: string,
  ) {
    setCustomerForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateCustomer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingCustomer(true);

    try {
      const response = await apiRequest<unknown>("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: customerForm.name.trim(),
          phone: customerForm.phone.trim(),
          email: customerForm.email.trim(),
          address: customerForm.address.trim(),
          notes: customerForm.notes.trim(),
        }),
      });

      const newCustomer = unwrapData<Customer>(response);

      if (!newCustomer?._id) {
        throw new Error(
          "Customer details were not returned by the server.",
        );
      }

      setCustomers((previous) => [
        newCustomer,
        ...previous.filter(
          (customer) => customer._id !== newCustomer._id,
        ),
      ]);

      // Automatically select the newly created customer.
      setSelectedCustomerId(newCustomer._id);
      setCustomerForm({ ...emptyCustomerForm });
      setShowCustomerForm(false);
      setSuccess("Customer created and selected successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create customer.",
      );
    } finally {
      setSavingCustomer(false);
    }
  }

  function updateProductRow(
    index: number,
    field: keyof ProductRow,
    value: string | number,
  ) {
    setProductRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [field]: value }
          : row,
      ),
    );
  }

  function addProductRow() {
    setProductRows((previous) => [
      ...previous,
      { productId: "", quantity: 1 },
    ]);
  }

  function removeProductRow(index: number) {
    setProductRows((previous) =>
      previous.length === 1
        ? [{ productId: "", quantity: 1 }]
        : previous.filter((_, rowIndex) => rowIndex !== index),
    );
  }

  async function handleCreateSale(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      setError("Please select or create a customer.");
      return;
    }

    const validRows = productRows.filter(
      (row) => row.productId && row.quantity > 0,
    );

    if (validRows.length === 0) {
      setError("Please select at least one product.");
      return;
    }

    for (const row of validRows) {
      const product = products.find(
        (item) => item._id === row.productId,
      );

      if (!product) {
        setError("Please select a valid product.");
        return;
      }

      if (!Number.isInteger(row.quantity) || row.quantity < 1) {
        setError("Quantity must be a positive whole number.");
        return;
      }

      if (row.quantity > product.stockQuantity) {
        setError(
          `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}.`,
        );
        return;
      }
    }

    // Generate the invoice number only when submitting the sale.
    const finalInvoiceNumber =
      invoiceNumber.trim() || `SALE-${Date.now()}`;

    setSavingSale(true);

    try {
      await apiRequest<unknown>("/sales", {
        method: "POST",
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          customerName: selectedCustomer.name,
          invoiceNumber: finalInvoiceNumber,
          items: validRows.map((row) => ({
            productId: row.productId,
            quantity: row.quantity,
          })),
        }),
      });

      // Reset customer and product inputs after successful API response.
      resetSaleForm();

      setSuccess(
        `Sale created successfully. Invoice: ${finalInvoiceNumber}`,
      );

      // Refresh products (stock), customers and sales history.
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create sale.",
      );
    } finally {
      setSavingSale(false);
    }
  }

  return (
    <main className="space-y-6 p-4 text-gray-900 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold">Sales Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create sales, manage customers, and view sales history.
        </p>
      </header>

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

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-gray-500">
          Loading sales data...
        </div>
      ) : (
        <>
          {/* Customer section */}
          <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Customer Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select an existing customer or create a new one.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCustomerForm((previous) => !previous);
                  setError("");
                  setSuccess("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {showCustomerForm
                  ? "Cancel New Customer"
                  : "+ New Customer"}
              </button>
            </div>

            <div>
              <label
                htmlFor="customer"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Select Existing Customer
              </label>

              <select
                id="customer"
                value={selectedCustomerId}
                onChange={(event) =>
                  setSelectedCustomerId(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Choose a customer</option>

                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} — {customer.phone}
                  </option>
                ))}
              </select>

              {customers.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No customers found. Create your first customer.
                </p>
              )}
            </div>

            {showCustomerForm && (
              <form
                onSubmit={handleCreateCustomer}
                className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4"
              >
                <div>
                  <h3 className="font-semibold">Create New Customer</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Name and phone are required. Other details are optional.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="customerName"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Name *
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={customerForm.name}
                      onChange={(event) =>
                        updateCustomerForm("name", event.target.value)
                      }
                      placeholder="Enter customer name"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Phone *
                    </label>
                    <input
                      id="customerPhone"
                      type="tel"
                      required
                      minLength={7}
                      maxLength={20}
                      value={customerForm.phone}
                      onChange={(event) =>
                        updateCustomerForm("phone", event.target.value)
                      }
                      placeholder="Enter phone number"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerEmail"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="customerEmail"
                      type="email"
                      value={customerForm.email}
                      onChange={(event) =>
                        updateCustomerForm("email", event.target.value)
                      }
                      placeholder="customer@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerAddress"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      id="customerAddress"
                      type="text"
                      maxLength={300}
                      value={customerForm.address}
                      onChange={(event) =>
                        updateCustomerForm("address", event.target.value)
                      }
                      placeholder="Enter address"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="customerNotes"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Notes
                    </label>
                    <textarea
                      id="customerNotes"
                      rows={3}
                      maxLength={500}
                      value={customerForm.notes}
                      onChange={(event) =>
                        updateCustomerForm("notes", event.target.value)
                      }
                      placeholder="Additional customer information (optional)"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={savingCustomer}
                    onClick={() => {
                      setShowCustomerForm(false);
                      setCustomerForm({ ...emptyCustomerForm });
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingCustomer}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingCustomer
                      ? "Saving Customer..."
                      : "Create Customer"}
                  </button>
                </div>
              </form>
            )}

            {selectedCustomer && (
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                <h3 className="mb-3 font-semibold">
                  Selected Customer Details
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">
                      {selectedCustomer.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">
                      {selectedCustomer.address || "Not provided"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap font-medium">
                      {selectedCustomer.notes || "No notes"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sale form */}
          <form
            onSubmit={handleCreateSale}
            className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Create New Sale</h2>

            <div>
              <label
                htmlFor="invoiceNumber"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Invoice Number
              </label>
              <input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(event) =>
                  setInvoiceNumber(event.target.value)
                }
                placeholder="Leave blank to generate automatically"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to generate an invoice number automatically.
              </p>
            </div>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">Products</h3>
                <button
                  type="button"
                  onClick={addProductRow}
                  className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  + Add Product
                </button>
              </div>

              {productRows.map((row, index) => {
                const product = products.find(
                  (item) => item._id === row.productId,
                );

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 items-end gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-5">
                      <label
                        htmlFor={`product-${index}`}
                        className="mb-1.5 block text-sm text-gray-600"
                      >
                        Product
                      </label>
                      <select
                        id={`product-${index}`}
                        value={row.productId}
                        onChange={(event) =>
                          updateProductRow(
                            index,
                            "productId",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500"
                      >
                        <option value="">Select product</option>
                        {products.map((item) => (
                          <option
                            key={item._id}
                            value={item._id}
                            disabled={item.stockQuantity < 1}
                          >
                            {item.name}
                            {item.sku ? ` (${item.sku})` : ""}
                            {" — Stock: "}
                            {item.stockQuantity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`quantity-${index}`}
                        className="mb-1.5 block text-sm text-gray-600"
                      >
                        Quantity
                      </label>
                      <input
                        id={`quantity-${index}`}
                        type="number"
                        min={1}
                        max={product?.stockQuantity || undefined}
                        value={row.quantity}
                        onChange={(event) =>
                          updateProductRow(
                            index,
                            "quantity",
                            Number(event.target.value),
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <p className="mb-1 text-sm text-gray-500">
                        Unit Price
                      </p>
                      <p className="py-2.5 font-medium">
                        {formatPrice(product?.sellingPrice || 0)}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="mb-1 text-sm text-gray-500">
                        Line Total
                      </p>
                      <p className="py-2.5 font-semibold">
                        {formatPrice(
                          (product?.sellingPrice || 0) * row.quantity,
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        aria-label="Remove product"
                        className="w-full rounded-lg border border-red-200 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatPrice(totalAmount)}
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSale || savingCustomer}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingSale ? "Creating Sale..." : "Complete Sale"}
              </button>
            </div>
          </form>

          {/* Sales history */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold">Sales History</h2>
              <p className="mt-1 text-sm text-gray-500">
                Recently created sales.
              </p>
            </div>

            {sales.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">
                No sales found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Products</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {sales.map((sale) => {
                      const customer =
                        sale.customerId &&
                        typeof sale.customerId === "object"
                          ? sale.customerId
                          : undefined;

                      return (
                        <tr key={sale._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            {sale.invoiceNumber}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-medium">
                              {customer?.name || sale.customerName}
                            </p>
                            {customer?.phone && (
                              <p className="mt-1 text-xs text-gray-500">
                                {customer.phone}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {sale.items?.map((item, index) => (
                              <p key={index} className="mb-1">
                                {getProductName(item.productId)} ×{" "}
                                {item.quantity}
                              </p>
                            ))}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 font-semibold">
                            {formatPrice(sale.totalAmount)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                            {sale.createdAt
                              ? new Date(
                                  sale.createdAt,
                                ).toLocaleDateString("en-IN")
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
