
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Staff {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "blocked";
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function StaffPage() {
  const { hasPermission } = useAuth();

  const canRead = hasPermission("staff", "read", "master");
  const canCreate = hasPermission("staff", "create", "master");
  const canUpdate = hasPermission("staff", "update", "master");

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Fetch staff data without updating state immediately
  const loadStaff = useCallback(async () => {
    const response = await apiRequest<ApiResponse<Staff[]>>(
      "/users/staff"
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to load staff");
    }

    return response.data || [];
  }, []);

  // Initial data loading
  useEffect(() => {
    if (!canRead) return;

    let cancelled = false;

    async function fetchInitialStaff() {
      try {
        const data = await loadStaff();

        if (!cancelled) {
          setStaffList(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load staff"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialStaff();

    return () => {
      cancelled = true;
    };
  }, [canRead, loadStaff]);

  // Refresh staff list
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await loadStaff();
      setStaffList(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load staff"
      );
    } finally {
      setLoading(false);
    }
  };

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Create Staff
  async function handleCreateStaff(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await apiRequest<ApiResponse<Staff>>(
        "/users/staff",
        {
          method: "POST",
          body: JSON.stringify(form),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Staff creation failed");
      }

      setSuccess("Staff created successfully!");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setShowForm(false);

      await fetchStaff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create staff"
      );
    } finally {
      setSaving(false);
    }
  }

  // Activate / Deactivate Staff
  async function handleStatusChange(staff: Staff) {
    const staffId = staff._id || staff.id;

    if (!staffId) {
      setError("Staff ID is missing");
      return;
    }

    const newStatus =
      staff.status === "active" ? "inactive" : "active";

    try {
      setError("");
      setSuccess("");

      const response = await apiRequest<ApiResponse<Staff>>(
        `/users/staff/${staffId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Status update failed");
      }

      setSuccess(`Staff ${newStatus} successfully`);

      await fetchStaff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Status update failed"
      );
    }
  }

  if (!canRead) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          You don't have permission to view Staff Management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Staff Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your mobile shop employees.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setError("");
              setSuccess("");
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Staff"}
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Create Staff Form */}
      {showForm && canCreate && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Create New Staff
          </h2>

          <form onSubmit={handleCreateStaff}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter staff name"
                  minLength={2}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="staff@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Temporary Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              New accounts will automatically receive the Staff role.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Staff"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Staff Members
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Total: {staffList.length} staff members
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStaff}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading staff...
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No staff members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>

                  {canUpdate && (
                    <th className="px-6 py-4">Action</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {staffList.map((staff) => (
                  <tr
                    key={staff._id || staff.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-800">
                      {staff.name}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {staff.email}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {staff.phone}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          staff.status === "active"
                            ? "bg-green-100 text-green-700"
                            : staff.status === "inactive"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>

                    {canUpdate && (
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          disabled={staff.status === "blocked"}
                          onClick={() => handleStatusChange(staff)}
                          className="text-xs font-medium text-blue-600 hover:underline disabled:text-gray-400"
                        >
                          {staff.status === "active"
                            ? "Deactivate"
                            : staff.status === "inactive"
                              ? "Activate"
                              : "Blocked"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
