"use client";

import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
      <div>
        <p className="text-sm text-gray-500">Workspace</p>
        <h2 className="text-lg font-semibold text-gray-900">
          Overview
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user?.name ?? "ERP User"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.email ?? "Signed in"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {(user?.name?.[0] ?? "U").toUpperCase()}
        </div>
      </div>
    </header>
  );
}