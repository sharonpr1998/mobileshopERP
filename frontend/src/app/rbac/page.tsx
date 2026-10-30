
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type RoleName = "super_admin" | "staff" | "customer";

interface Role {
  _id: string;
  name: RoleName;
  description?: string;
  isSystemRole?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RoleForm {
  name: RoleName;
  description: string;
}

const initialForm: RoleForm = {
  name: "staff",
  description: "",
};

export default function RbacPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<RoleForm>(initialForm);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRoles() {
      try {
        const response =
          await apiRequest<ApiResponse<Role[]>>("/rbac/roles");

        if (active) setRoles(response.data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load roles",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRoles();

    return () => {
      active = false;
    };
  }, []);

  function openCreateForm() {
    setEditingRole(null);
    setForm(initialForm);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function openEditForm(role: Role) {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description ?? "",
    });
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingRole) {
        await apiRequest<ApiResponse<Role>>(
          `/rbac/roles/${editingRole._id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              description: form.description,
            }),
          },
        );

        setMessage("Role updated successfully.");
      } else {
        await apiRequest<ApiResponse<Role>>("/rbac/roles", {
          method: "POST",
          body: JSON.stringify(form),
        });

        setMessage("Role created successfully.");
      }

      const response =
        await apiRequest<ApiResponse<Role[]>>("/rbac/roles");

      setRoles(response.data);
      setShowForm(false);
      setEditingRole(null);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Request failed",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Role Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage roles and access in your Mobile Shop ERP.
            </p>
          </div>

          <button
            type="button"
            onClick={showForm ? () => setShowForm(false) : openCreateForm}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Create Role"}
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5"
          >
            <h2 className="text-lg font-semibold">
              {editingRole ? "Edit Role" : "Create Role"}
            </h2>

            <div>
              <label
                htmlFor="roleName"
                className="mb-1.5 block text-sm font-medium"
              >
                Role Name
              </label>
              <select
                id="roleName"
                value={form.name}
                disabled={Boolean(editingRole)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value as RoleName,
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="roleDescription"
                className="mb-1.5 block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="roleDescription"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                maxLength={300}
                rows={3}
                placeholder="Enter role description"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingRole
                  ? "Update Role"
                  : "Save Role"}
            </button>
          </form>
        )}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold">Roles ({roles.length})</h2>
          </div>

          {loading ? (
            <p className="p-5 text-gray-600">Loading roles...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Role Name</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {roles.map((role) => (
                    <tr key={role._id}>
                      <td className="px-5 py-4 font-medium">
                        {role.name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {role.description || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {role.isSystemRole ? "System role" : "Custom role"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(role)}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {roles.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No roles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
