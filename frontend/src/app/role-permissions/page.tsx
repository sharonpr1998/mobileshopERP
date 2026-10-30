
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Role {
  _id: string;
  name: string;
}

interface Permission {
  _id: string;
  moduleId: { _id: string; name: string } | string;
  moduleTypeId: { _id: string; name: string } | string;
  actionId: { _id: string; name: string } | string;
}

interface PermissionAssignment {
  _id: string;
  permissionId: Permission | string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface RolePermissionData {
  permissionIds?: string[];
  permissions?: PermissionAssignment[];
}

function getPermissionIds(data: unknown): string[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const result = data as RolePermissionData;

  if (Array.isArray(result.permissionIds)) {
    return result.permissionIds.filter(
      (id): id is string => typeof id === "string",
    );
  }

  if (Array.isArray(result.permissions)) {
    return result.permissions
      .map((assignment) => {
        const permission = assignment.permissionId;

        if (typeof permission === "string") {
          return permission;
        }

        if (
          permission &&
          typeof permission === "object" &&
          typeof permission._id === "string"
        ) {
          return permission._id;
        }

        return "";
      })
      .filter(Boolean);
  }

  return [];
}

function getName(value: { name: string } | string): string {
  return typeof value === "string" ? value : value.name;
}

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load roles and available permissions
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          apiRequest<ApiResponse<Role[]>>("/rbac/roles"),
          apiRequest<ApiResponse<Permission[]>>("/rbac/permissions"),
        ]);

        if (cancelled) return;

        setRoles(rolesResponse.data ?? []);
        setPermissions(permissionsResponse.data ?? []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to load data",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load assigned permissions when selecting a role
  async function handleRoleChange(roleId: string) {
    setSelectedRole(roleId);
    setSelectedPermissions([]);
    setError("");
    setMessage("");

    if (!roleId) {
      return;
    }

    setLoadingRolePermissions(true);

    try {
      const response = await apiRequest<ApiResponse<unknown>>(
        `/rbac/roles/${roleId}/permissions`,
      );

      // Extract actual permission IDs, not assignment IDs.
      setSelectedPermissions(getPermissionIds(response.data));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load role permissions",
      );
    } finally {
      setLoadingRolePermissions(false);
    }
  }

  // Select or deselect one permission
  function handlePermissionChange(
    permissionId: string,
    checked: boolean,
  ) {
    setSelectedPermissions((current) => {
      if (checked) {
        return current.includes(permissionId)
          ? current
          : [...current, permissionId];
      }

      return current.filter((id) => id !== permissionId);
    });
  }

  // Select all or deselect all permissions
  function handleSelectAll() {
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(
        permissions.map((permission) => permission._id),
      );
    }
  }

  // Save assigned permissions
  async function handleSave() {
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest<ApiResponse<unknown>>(
        `/rbac/roles/${selectedRole}/permissions`,
        {
          method: "PUT",
          body: JSON.stringify({
            permissionIds: selectedPermissions,
          }),
        },
      );

      // Use the saved response to keep the selection synchronized.
      setSelectedPermissions(getPermissionIds(response.data));

      setMessage(
        response.message || "Permissions saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save permissions",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Role Permissions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Assign permissions to each role.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="role"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Select Role
        </label>

        <select
          id="role"
          value={selectedRole}
          onChange={(event) => {
            void handleRoleChange(event.target.value);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Choose a role</option>

          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

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

      {loading ? (
        <p className="py-8 text-center text-gray-500">
          Loading roles and permissions...
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Permissions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedPermissions.length} selected
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                disabled={
                  !selectedRole ||
                  loadingRolePermissions ||
                  saving ||
                  permissions.length === 0
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedPermissions.length === permissions.length &&
                permissions.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {!selectedRole ? (
              <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                Please select a role first.
              </p>
            ) : loadingRolePermissions ? (
              <p className="py-8 text-center text-gray-500">
                Loading assigned permissions...
              </p>
            ) : permissions.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                No permissions found. Create permissions first.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {permissions.map((permission) => (
                  <label
                    key={permission._id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(
                        permission._id,
                      )}
                      disabled={saving}
                      onChange={(event) =>
                        handlePermissionChange(
                          permission._id,
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-blue-600"
                    />

                    <span className="min-w-0">
                      <span className="block font-medium text-gray-900">
                        {getName(permission.moduleId)}
                      </span>

                      <span className="mt-1 block text-sm text-gray-500">
                        {getName(permission.moduleTypeId)} ·{" "}
                        {getName(permission.actionId)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={
                !selectedRole ||
                saving ||
                loadingRolePermissions ||
                loading
              }
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
