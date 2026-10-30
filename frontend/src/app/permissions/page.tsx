
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Module {
  _id: string;
  name: string;
  code: string;
}

interface ModuleType {
  _id: string;
  name: string;
  code: string;
}

interface Action {
  _id: string;
  name: string;
  code: string;
}

interface Permission {
  _id: string;
  moduleId: Module | string;
  moduleTypeId: ModuleType | string;
  actionId: Action | string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function PermissionsPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleTypes, setModuleTypes] = useState<ModuleType[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [moduleId, setModuleId] = useState("");
  const [moduleTypeId, setModuleTypeId] = useState("");
  const [actionId, setActionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [moduleResponse, typeResponse, actionResponse, permissionResponse] =
          await Promise.all([
            apiRequest<ApiResponse<Module[]>>("/rbac/modules"),
            apiRequest<ApiResponse<ModuleType[]>>("/rbac/module-types"),
            apiRequest<ApiResponse<Action[]>>("/rbac/actions"),
            apiRequest<ApiResponse<Permission[]>>("/rbac/permissions"),
          ]);

        if (!active) return;

        setModules(moduleResponse.data);
        setModuleTypes(typeResponse.data);
        setActions(actionResponse.data);
        setPermissions(permissionResponse.data);
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load permission data",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await apiRequest<ApiResponse<Permission>>(
        "/rbac/permissions",
        {
          method: "POST",
          body: JSON.stringify({
            moduleId,
            moduleTypeId,
            actionId,
          }),
        },
      );

      setPermissions((current) => [...current, response.data]);
      setSuccess("Permission created successfully.");

      setModuleId("");
      setModuleTypeId("");
      setActionId("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create permission",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(permission: Permission) {
    if (!window.confirm("Are you sure you want to delete this permission?")) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(permission._id);

    try {
      await apiRequest(`/rbac/permissions/${permission._id}`, {
        method: "DELETE",
      });

      setPermissions((current) =>
        current.filter((item) => item._id !== permission._id),
      );

      setSuccess("Permission deleted successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete permission",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getName(
    item: Module | ModuleType | Action | string,
  ): string {
    if (typeof item === "string") return item;
    return item.name;
  }

  function getModuleName(permission: Permission) {
    return getName(permission.moduleId);
  }

  function getModuleTypeName(permission: Permission) {
    return getName(permission.moduleTypeId);
  }

  function getActionName(permission: Permission) {
    return getName(permission.actionId);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Permission Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Combine modules, module types and actions to create permissions.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-3"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Module
          </label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            required
            className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
          >
            <option value="">Select module</option>
            {modules.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Module Type
          </label>
          <select
            value={moduleTypeId}
            onChange={(e) => setModuleTypeId(e.target.value)}
            required
            className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
          >
            <option value="">Select module type</option>
            {moduleTypes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Action
          </label>
          <select
            value={actionId}
            onChange={(e) => setActionId(e.target.value)}
            required
            className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
          >
            <option value="">Select action</option>
            {actions.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving || !modules.length || !moduleTypes.length || !actions.length}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
        >
          {saving ? "Creating..." : "Create Permission"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <section className="overflow-x-auto rounded-xl border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold text-gray-900">
            Permissions ({permissions.length})
          </h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Module</th>
              <th className="p-4">Module Type</th>
              <th className="p-4">Action</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading permissions...
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No permissions found.
                </td>
              </tr>
            ) : (
              permissions.map((permission) => (
                <tr key={permission._id}>
                  <td className="p-4 font-medium text-gray-900">
                    {getModuleName(permission)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {getModuleTypeName(permission)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {getActionName(permission)}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      disabled={deletingId === permission._id}
                      onClick={() => void handleDelete(permission)}
                      className="font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === permission._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
