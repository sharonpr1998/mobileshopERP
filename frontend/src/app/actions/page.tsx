
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Action {
  _id: string;
  name: string;
  code: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActions() {
      try {
        const response = await apiRequest<ApiResponse<Action[]>>(
          "/rbac/actions",
        );

        if (active) setActions(response.data);
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load actions",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadActions();

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
        const response = await apiRequest<ApiResponse<Action>>(
          `/rbac/actions/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

        setActions((current) =>
          current.map((item) =>
            item._id === editingId ? response.data : item,
          ),
        );

        setSuccess("Action updated successfully.");
      } else {
        const response = await apiRequest<ApiResponse<Action>>(
          "/rbac/actions",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

        setActions((current) => [...current, response.data]);
        setSuccess("Action created successfully.");
      }

      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Operation failed",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: Action) {
    setEditingId(item._id);
    setName(item.name);
    setCode(item.code);
    setError("");
    setSuccess("");
  }

  async function handleDelete(item: Action) {
    if (!window.confirm(`Delete action "${item.name}"?`)) return;

    setError("");
    setSuccess("");

    try {
      await apiRequest(`/rbac/actions/${item._id}`, {
        method: "DELETE",
      });

      setActions((current) =>
        current.filter((action) => action._id !== item._id),
      );

      if (editingId === item._id) resetForm();

      setSuccess("Action deleted successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete action",
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Action Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage actions used to define ERP permissions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Action name (e.g. Create)"
          required
          minLength={2}
          className="rounded-lg border px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
        />

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Action code (e.g. create)"
          required
          pattern="[a-zA-Z0-9_-]+"
          title="Use letters, numbers, hyphens or underscores"
          className="rounded-lg border px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Update Action"
              : "Add Action"}
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
            Actions ({actions.length})
          </h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Action Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading actions...
                </td>
              </tr>
            ) : actions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No actions found.
                </td>
              </tr>
            ) : (
              actions.map((item) => (
                <tr key={item._id}>
                  <td className="p-4 font-medium text-gray-900">
                    {item.name}
                  </td>

                  <td className="p-4 text-gray-600">{item.code}</td>

                  <td className="p-4">
                    <span
                      className={
                        item.isActive === false
                          ? "rounded-full bg-red-100 px-3 py-1 text-red-700"
                          : "rounded-full bg-green-100 px-3 py-1 text-green-700"
                      }
                    >
                      {item.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>

                  <td className="space-x-3 whitespace-nowrap p-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
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
