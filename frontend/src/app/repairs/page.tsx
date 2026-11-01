"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type RepairStatus =
  | "received"
  | "in_progress"
  | "ready"
  | "delivered"
  | "cancelled";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface Repair {
  _id: string;
  customerId: string | Customer;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  issue: string;
  estimatedCost: number;
  status: RepairStatus;
  createdAt?: string;
}

interface RepairForm {
  customerId: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string;
  issue: string;
  estimatedCost: string;
}

interface NewCustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const emptyForm: RepairForm = {
  customerId: "",
  deviceBrand: "",
  deviceModel: "",
  imei: "",
  issue: "",
  estimatedCost: "0",
};

const emptyCustomerForm: NewCustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const statuses: RepairStatus[] = [
  "received",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
];

function unwrapData<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }

  return response as T;
}

function getList<T>(value: unknown, key: string): T[] {
  if (Array.isArray(value)) return value as T[];

  if (value && typeof value === "object") {
    const result = value as Record<string, unknown>;

    if (Array.isArray(result[key])) return result[key] as T[];

    if (result.data !== undefined) {
      return getList<T>(result.data, key);
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

function getCustomer(repair: Repair): Customer | undefined {
  return typeof repair.customerId === "object"
    ? repair.customerId
    : undefined;
}

function getStatusLabel(status: RepairStatus): string {
  const labels: Record<RepairStatus, string> = {
    received: "Received",
    in_progress: "In Progress",
    ready: "Ready for Pickup",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function getStatusStyle(status: RepairStatus): string {
  const styles: Record<RepairStatus, string> = {
    received: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    ready: "bg-green-50 text-green-700",
    delivered: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return styles[status];
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function RepairsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [form, setForm] = useState<RepairForm>(emptyForm);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] =
    useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] =
    useState<NewCustomerForm>(emptyCustomerForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Twilio SMS testing states
  const [testPhone, setTestPhone] = useState("");
  const [testingSms, setTestingSms] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsError, setSmsError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [customerResponse, repairResponse] = await Promise.all([
        apiRequest<unknown>("/customers"),
        apiRequest<unknown>("/repairs"),
      ]);

      setCustomers(
        getList<Customer>(unwrapData(customerResponse), "customers"),
      );

      setRepairs(getList<Repair>(unwrapData(repairResponse), "repairs"));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load repair data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void loadData(), 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  function updateForm(field: keyof RepairForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateNewCustomer(
    field: keyof NewCustomerForm,
    value: string,
  ) {
    setNewCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  const matchingCustomers = customers
    .filter((customer) => {
      const query = customerSearch.trim().toLowerCase();

      if (!query) return false;

      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    })
    .slice(0, 6);

  const duplicatePhoneCustomer = newCustomer.phone.trim()
    ? customers.find(
        (customer) =>
          customer.phone.replace(/\D/g, "") ===
          newCustomer.phone.replace(/\D/g, ""),
      )
    : undefined;

  function chooseCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setCustomerSearch(`${customer.name} — ${customer.phone}`);

    setForm((previous) => ({
      ...previous,
      customerId: customer._id,
    }));

    setAddingCustomer(false);
    setShowCustomerSuggestions(false);
    setNewCustomer(emptyCustomerForm);
  }

  function startAddingCustomer() {
    setSelectedCustomer(null);

    setForm((previous) => ({
      ...previous,
      customerId: "",
    }));

    setCustomerSearch("");
    setNewCustomer(emptyCustomerForm);
    setAddingCustomer(true);
    setShowCustomerSuggestions(false);
  }

  async function createCustomerIfNeeded(): Promise<string> {
    if (!addingCustomer) {
      if (!form.customerId) {
        throw new Error(
          "Please select a customer or add a new one.",
        );
      }

      return form.customerId;
    }

    const name = newCustomer.name.trim();
    const phone = newCustomer.phone.trim();

    if (!name) {
      throw new Error("Please enter the customer name.");
    }

    if (!phone) {
      throw new Error("Please enter the customer phone number.");
    }

    const existingByPhone = customers.find(
      (customer) =>
        customer.phone.replace(/\D/g, "") ===
        phone.replace(/\D/g, ""),
    );

    if (existingByPhone) {
      chooseCustomer(existingByPhone);
      return existingByPhone._id;
    }

    const response = await apiRequest<unknown>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name,
        phone,
        email: newCustomer.email.trim(),
        address: newCustomer.address.trim(),
        notes: newCustomer.notes.trim(),
      }),
    });

    const created = unwrapData<Customer>(response);

    if (!created?._id) {
      throw new Error(
        "Customer was created, but the response did not include a customer ID.",
      );
    }

    setCustomers((previous) => [created, ...previous]);
    setSelectedCustomer(created);
    setCustomerSearch(`${created.name} — ${created.phone}`);

    setForm((previous) => ({
      ...previous,
      customerId: created._id,
    }));

    setAddingCustomer(false);
    setNewCustomer(emptyCustomerForm);

    return created._id;
  }

  async function handleCreateRepair(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!addingCustomer && !form.customerId) {
      setError(
        "Please select an existing customer or add a new customer.",
      );
      return;
    }

    if (!form.deviceBrand.trim() || !form.deviceModel.trim()) {
      setError("Please enter the device brand and model.");
      return;
    }

    if (!form.issue.trim()) {
      setError("Please describe the device issue.");
      return;
    }

    const estimatedCost = Number(form.estimatedCost);

    if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
      setError("Estimated cost must be zero or greater.");
      return;
    }

    setSaving(true);

    try {
      const customerId = await createCustomerIfNeeded();

      await apiRequest<unknown>("/repairs", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          deviceBrand: form.deviceBrand.trim(),
          deviceModel: form.deviceModel.trim(),
          imei: form.imei.trim(),
          issue: form.issue.trim(),
          estimatedCost,
        }),
      });

      setForm({ ...emptyForm });
      setCustomerSearch("");
      setSelectedCustomer(null);
      setAddingCustomer(false);
      setNewCustomer(emptyCustomerForm);

      setSuccess("Repair job created successfully.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create repair job.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(
    repairId: string,
    status: RepairStatus,
  ) {
    setError("");
    setSuccess("");
    setUpdatingId(repairId);

    try {
      await apiRequest<unknown>(`/repairs/${repairId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setSuccess("Repair status updated successfully.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update repair status.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  // Send test SMS through backend
  async function handleTestSms(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSmsMessage("");
    setSmsError("");

    const phone = testPhone.trim();

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setSmsError(
        "Enter a valid phone number with country code. Example: +919876543210",
      );
      return;
    }

    setTestingSms(true);

    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        data?: {
          messageSid: string;
        };
      }>("/repairs/test-sms", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });

      setSmsMessage(
        response.message ||
          "Test SMS submitted successfully to Twilio.",
      );
    } catch (err) {
      setSmsError(
        err instanceof Error
          ? err.message
          : "Failed to send test SMS.",
      );
    } finally {
      setTestingSms(false);
    }
  }

  const filteredRepairs = repairs.filter((repair) => {
    const customer = getCustomer(repair);
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      customer?.name?.toLowerCase().includes(query) ||
      customer?.phone?.toLowerCase().includes(query) ||
      repair.deviceBrand.toLowerCase().includes(query) ||
      repair.deviceModel.toLowerCase().includes(query) ||
      repair.imei?.toLowerCase().includes(query) ||
      repair.issue.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || repair.status === statusFilter;

    return Boolean(matchesSearch && matchesStatus);
  });

  const totalRepairs = repairs.length;

  const receivedCount = repairs.filter(
    (repair) => repair.status === "received",
  ).length;

  const inProgressCount = repairs.filter(
    (repair) => repair.status === "in_progress",
  ).length;

  const readyCount = repairs.filter(
    (repair) => repair.status === "ready",
  ).length;

  return (
    <main className="space-y-6 p-4 text-gray-900 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Repair Management
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Manage customer repairs, track repair status and send SMS
          notifications.
        </p>
      </header>

      {/* Twilio SMS Testing */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Twilio SMS Testing
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Send a test SMS to your verified mobile number.
          </p>
        </div>

        <form
          onSubmit={handleTestSms}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="tel"
            value={testPhone}
            onChange={(event) => setTestPhone(event.target.value)}
            placeholder="+919876543210"
            required
            className={inputClass}
          />

          <button
            type="submit"
            disabled={testingSms}
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testingSms ? "Sending SMS..." : "Send Test SMS"}
          </button>
        </form>

        {smsMessage && (
          <p
            role="status"
            className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800"
          >
            {smsMessage}
          </p>
        )}

        {smsError && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          >
            {smsError}
          </p>
        )}

        <p className="mt-3 text-xs text-gray-500">
          Use your verified Twilio recipient number with country code.
          Example: +919876543210
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Repairs</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalRepairs}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Received</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {receivedCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {inProgressCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ready for Pickup</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {readyCount}
          </p>
        </div>
      </section>

      {/* Create Repair */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Repair Job
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select an existing customer or add a new customer.
          </p>
        </div>

        <form onSubmit={handleCreateRepair} className="space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className={labelClass}>Customer *</label>

              <button
                type="button"
                onClick={startAddingCustomer}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add New Customer
              </button>
            </div>

            {!addingCustomer ? (
              <div className="relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(event) => {
                    setCustomerSearch(event.target.value);
                    setSelectedCustomer(null);
                    setForm((previous) => ({
                      ...previous,
                      customerId: "",
                    }));
                    setShowCustomerSuggestions(true);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  placeholder="Search customer by name or phone..."
                  className={inputClass}
                />

                {showCustomerSuggestions &&
                  matchingCustomers.length > 0 && (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {matchingCustomers.map((customer) => (
                        <button
                          key={customer._id}
                          type="button"
                          onClick={() => chooseCustomer(customer)}
                          className="block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <p className="font-medium text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.phone}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                {selectedCustomer && (
                  <p className="mt-2 text-sm text-green-700">
                    Selected: {selectedCustomer.name}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    New Customer Details
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      setAddingCustomer(false);
                      setNewCustomer(emptyCustomerForm);
                    }}
                    className="text-sm font-medium text-red-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="newCustomerName" className={labelClass}>
                      Customer Name *
                    </label>
                    <input
                      id="newCustomerName"
                      required
                      value={newCustomer.name}
                      onChange={(event) =>
                        updateNewCustomer("name", event.target.value)
                      }
                      placeholder="Enter customer name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="newCustomerPhone" className={labelClass}>
                      Phone Number *
                    </label>
                    <input
                      id="newCustomerPhone"
                      type="tel"
                      required
                      value={newCustomer.phone}
                      onChange={(event) =>
                        updateNewCustomer("phone", event.target.value)
                      }
                      placeholder="Enter phone number for SMS"
                      className={inputClass}
                    />

                    {duplicatePhoneCustomer && (
                      <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                        This phone number already belongs to{" "}
                        <strong>{duplicatePhoneCustomer.name}</strong>. We
                        will use that existing customer instead of creating
                        a duplicate.

                        <button
                          type="button"
                          onClick={() =>
                            chooseCustomer(duplicatePhoneCustomer)
                          }
                          className="mt-1 block font-semibold underline"
                        >
                          Select existing customer
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newCustomerEmail" className={labelClass}>
                      Email (optional)
                    </label>
                    <input
                      id="newCustomerEmail"
                      type="email"
                      value={newCustomer.email}
                      onChange={(event) =>
                        updateNewCustomer("email", event.target.value)
                      }
                      placeholder="name@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="newCustomerAddress" className={labelClass}>
                      Address (optional)
                    </label>
                    <input
                      id="newCustomerAddress"
                      value={newCustomer.address}
                      onChange={(event) =>
                        updateNewCustomer("address", event.target.value)
                      }
                      placeholder="Customer address"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="newCustomerNotes" className={labelClass}>
                      Notes (optional)
                    </label>
                    <textarea
                      id="newCustomerNotes"
                      rows={2}
                      value={newCustomer.notes}
                      onChange={(event) =>
                        updateNewCustomer("notes", event.target.value)
                      }
                      placeholder="Additional customer notes"
                      className={inputClass}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Customers with the same phone number are reused to help
                  prevent duplicate records.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="deviceBrand" className={labelClass}>
                Device Brand *
              </label>
              <input
                id="deviceBrand"
                required
                maxLength={100}
                value={form.deviceBrand}
                onChange={(event) =>
                  updateForm("deviceBrand", event.target.value)
                }
                placeholder="e.g. Samsung, Apple, Redmi"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="deviceModel" className={labelClass}>
                Device Model *
              </label>
              <input
                id="deviceModel"
                required
                maxLength={100}
                value={form.deviceModel}
                onChange={(event) =>
                  updateForm("deviceModel", event.target.value)
                }
                placeholder="e.g. Galaxy S24, iPhone 15"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="imei" className={labelClass}>
                IMEI / Serial Number
              </label>
              <input
                id="imei"
                maxLength={50}
                value={form.imei}
                onChange={(event) =>
                  updateForm("imei", event.target.value)
                }
                placeholder="Enter IMEI or serial number"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="estimatedCost" className={labelClass}>
                Estimated Cost (₹) *
              </label>
              <input
                id="estimatedCost"
                type="number"
                required
                min={0}
                step="0.01"
                value={form.estimatedCost}
                onChange={(event) =>
                  updateForm("estimatedCost", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="issue" className={labelClass}>
              Customer Complaint / Device Issue *
            </label>
            <textarea
              id="issue"
              required
              rows={4}
              maxLength={1000}
              value={form.issue}
              onChange={(event) =>
                updateForm("issue", event.target.value)
              }
              placeholder="Describe the problem, e.g. display damaged, battery draining..."
              className={inputClass}
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {form.issue.length}/1000
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setForm({ ...emptyForm });
                setCustomerSearch("");
                setSelectedCustomer(null);
                setAddingCustomer(false);
                setNewCustomer(emptyCustomerForm);
                setError("");
                setSuccess("");
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={saving || (!addingCustomer && customers.length === 0)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating Repair..." : "Create Repair Job"}
            </button>
          </div>
        </form>
      </section>

      {/* Repair History */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Repair History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search repair jobs and update their status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, phone, model, IMEI..."
              className={inputClass}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">
            Loading repair records...
          </p>
        ) : filteredRepairs.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No repair jobs found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Est. Cost</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Update Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRepairs.map((repair) => {
                  const customer = getCustomer(repair);

                  const isFinal =
                    repair.status === "delivered" ||
                    repair.status === "cancelled";

                  return (
                    <tr
                      key={repair._id}
                      className="align-top hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">
                          {customer?.name || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {customer?.phone || "Phone unavailable"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">
                          {repair.deviceBrand} {repair.deviceModel}
                        </p>
                        {repair.imei && (
                          <p className="mt-1 text-xs text-gray-500">
                            IMEI: {repair.imei}
                          </p>
                        )}
                      </td>

                      <td className="max-w-xs whitespace-pre-wrap px-4 py-4 text-gray-900">
                        {repair.issue}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                        {formatPrice(repair.estimatedCost)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(repair.status)}`}
                        >
                          {getStatusLabel(repair.status)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                        {repair.createdAt
                          ? new Date(repair.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "—"}
                      </td>

                      <td className="min-w-48 px-4 py-4">
                        {isFinal ? (
                          <span className="text-xs text-gray-500">
                            No further changes
                          </span>
                        ) : (
                          <select
                            value={repair.status}
                            disabled={updatingId === repair._id}
                            onChange={(event) =>
                              void handleStatusUpdate(
                                repair._id,
                                event.target.value as RepairStatus,
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 disabled:opacity-50"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        )}

                        {updatingId === repair._id && (
                          <p className="mt-1 text-xs text-gray-500">
                            Updating...
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}