
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const dashboardPaths = [
  "/dashboard",
  "/products",
  "/categories",
  "/stock",
  "/purchases",
  "/sales",
  "/customers",
  "/staff",
  "/repairs",
  "/attendance",
  "/rbac",
  "/modules",
  "/module-types",
  "/actions",
  "/permissions",
  "/role-permissions",
];

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const showSidebar = dashboardPaths.some(
    (path) =>
      pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
