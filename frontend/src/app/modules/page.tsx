
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Module {
  _id: string;
  name: string;
  code: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadModules() {
      try {
        const response = await apiRequest<ApiResponse<Module[]>>(
          "/rbac/modules",
        );

        if (active) {
          setModules(response.data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load modules",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadModules();

    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setName("");
    setCode("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toLowerCase(),
      };

      if (editingId) {
        const response = await apiRequest<ApiResponse<Module>>(
          `/rbac/modules/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

        setModules((current) =>
          current.map((module) =>
            module._id === editingId ? response.data : module,
          ),
        );

        setSuccess("Module updated successfully.");
      } else {
        const response = await apiRequest<ApiResponse<Module>>(
          "/rbac/modules",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

        setModules((current) => [...current, response.data]);
        setSuccess("Module created successfully.");
      }

      resetForm();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Operation failed",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(module: Module) {
    setEditingId(module._id);
    setName(module.name);
    setCode(module.code);
    setError("");
    setSuccess("");
  }

  async function handleDelete(module: Module) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${module.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await apiRequest(`/rbac/modules/${module._id}`, {
        method: "DELETE",
      });

      setModules((current) =>
        current.filter((item) => item._id !== module._id),
      );

      if (editingId === module._id) resetForm();

      setSuccess("Module deleted successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete module",
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Module Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage ERP modules and their codes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Module name"
          required
          minLength={2}
          className="rounded-lg border px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
        />

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Module code (e.g. inventory)"
          required
          pattern="[a-zA-Z0-9_-]+"
          title="Use letters, numbers, hyphens or underscores"
          className="rounded-lg border px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Update Module"
              : "Add Module"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50 sm:col-span-3"
          >
            Cancel Edit
          </button>
        )}
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
            Modules ({modules.length})
          </h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Module Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading modules...
                </td>
              </tr>
            ) : modules.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No modules found.
                </td>
              </tr>
            ) : (
              modules.map((module) => (
                <tr key={module._id}>
                  <td className="p-4 font-medium text-gray-900">
                    {module.name}
                  </td>

                  <td className="p-4 text-gray-600">
                    {module.code}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        module.isActive === false
                          ? "rounded-full bg-red-100 px-3 py-1 text-red-700"
                          : "rounded-full bg-green-100 px-3 py-1 text-green-700"
                      }
                    >
                      {module.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>

                  <td className="space-x-3 whitespace-nowrap p-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(module)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(module)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Delete
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
