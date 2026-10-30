
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface ApiResult<T> {
  success?: boolean;
  message?: string;
  data: T;
}

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function formatDate(date?: string) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleDateString("en-IN");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCustomers() {
      try {
        const query = new URLSearchParams();

        if (search) query.set("search", search);

        const endpoint = query.size
          ? `/customers?${query.toString()}`
          : "/customers";

        const result = await apiRequest<ApiResult<Customer[]>>(endpoint);

        if (cancelled) return;

        const customerList = Array.isArray(result.data)
          ? result.data
          : [];

        setCustomers(customerList);

        setSelectedCustomer((current) => {
          if (!current) return null;

          return (
            customerList.find(
              (customer) => customer._id === current._id,
            ) ?? null
          );
        });

        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load customers.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, [search, refreshKey]);

  const updateField = (
    field: keyof CustomerForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSearch(searchInput.trim());
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.name.trim().length < 2) {
      setError("Customer name must contain at least 2 characters.");
      return;
    }

    if (
      form.phone.trim().length < 7 ||
      form.phone.trim().length > 20
    ) {
      setError("Phone number must contain 7 to 20 characters.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest<ApiResult<Customer>>(
        "/customers",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
            notes: form.notes.trim(),
          }),
        },
      );

      setMessage(result.message ?? "Customer created successfully.");
      setForm(emptyForm);
      setSelectedCustomer(result.data ?? null);
      setSearchInput("");
      setSearch("");
      setLoading(true);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create customer.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen space-y-6 bg-gray-50 p-4 text-gray-900 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create customers and view their complete details.
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

      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      {/* Add customer */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold">Add New Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="customer-name"
                className="mb-1 block text-sm font-medium"
              >
                Full Name *
              </label>
              <input
                id="customer-name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Enter full name"
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="customer-phone"
                className="mb-1 block text-sm font-medium"
              >
                Phone Number *
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="Enter phone number"
                minLength={7}
                maxLength={20}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="customer-email"
                className="mb-1 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="customer@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="customer-address"
                className="mb-1 block text-sm font-medium"
              >
                Address
              </label>
              <textarea
                id="customer-address"
                rows={2}
                maxLength={300}
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                placeholder="Enter full address"
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="customer-notes"
                className="mb-1 block text-sm font-medium"
              >
                Notes
              </label>
              <textarea
                id="customer-notes"
                rows={3}
                maxLength={500}
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Additional customer information"
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Customer"}
          </button>
        </form>
      </section>

      {/* Customer list */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Customer List</h2>
            <p className="mt-1 text-sm text-gray-500">
              {customers.length} customer(s) returned
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or phone"
              aria-label="Search customers by name or phone"
              className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 sm:w-64"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading customers...
          </p>
        ) : customers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No customers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{customer.name}</td>
                    <td className="p-3">{customer.phone}</td>
                    <td className="p-3">{customer.email || "—"}</td>
                    <td className="max-w-56 p-3">
                      <span className="line-clamp-2">
                        {customer.address || "—"}
                      </span>
                    </td>
                    <td className="max-w-56 p-3">
                      <span className="line-clamp-2">
                        {customer.notes || "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-blue-700 hover:bg-blue-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Full customer details */}
      {selectedCustomer && (
        <section className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Full Customer Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Complete information for {selectedCustomer.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Customer ID</p>
              <p className="mt-1 break-all text-sm font-medium">
                {selectedCustomer._id}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="mt-1 font-medium">{selectedCustomer.name}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="mt-1 font-medium">{selectedCustomer.phone}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Email</p>
              <p className="mt-1 break-words">
                {selectedCustomer.email || "Not provided"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Address</p>
              <p className="mt-1 break-words">
                {selectedCustomer.address || "Not provided"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Notes</p>
              <p className="mt-1 break-words">
                {selectedCustomer.notes || "No notes"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Status</p>
              <p className="mt-1 font-medium">
                {selectedCustomer.isActive === false ? "Inactive" : "Active"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Created Date</p>
              <p className="mt-1 font-medium">
                {formatDate(selectedCustomer.createdAt)}
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
