
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  {
    label: "Products",
    href: "/products",
    icon: "▣",
    module: "inventory",
    moduleType: "master",
  },
  {
    label: "Categories",
    href: "/categories",
    icon: "▤",
    module: "inventory",
    moduleType: "master",
  },
  {
    label: "Sales",
    href: "/sales",
    icon: "↑",
    module: "sales",
    moduleType: "transaction",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "♙",
    module: "customer",
    moduleType: "master",
  },
  {
    label: "Staff Management",
    href: "/staff",
    icon: "♟",
    module: "staff",
    moduleType: "master",
  },
  {
    label: "Repairs",
    href: "/repairs",
    icon: "⚙",
    module: "repair",
    moduleType: "transaction",
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: "◷",
    module: "attendance",
    moduleType: "transaction",
  },
];

const rbacNavigation = [
  { label: "Roles", href: "/rbac" },
  { label: "Modules", href: "/modules" },
  { label: "Module Types", href: "/module-types" },
  { label: "Actions", href: "/actions" },
  { label: "Permissions", href: "/permissions" },
  { label: "Role Permissions", href: "/role-permissions" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, loading, logout, hasPermission } = useAuth();

  const isSuperAdmin =
    user?.role?.toLowerCase() === "super_admin";

  const isCustomer =
    user?.role?.toLowerCase() === "customer";

  const [rbacOpen, setRbacOpen] = useState(
    rbacNavigation.some(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    )
  );

  // Customer does not need the ERP sidebar.
  if (loading || !user || isCustomer) {
    return null;
  }

  // Show only permitted menus for staff.
  const visibleNavigation = navigation.filter((item) => {
    if (isSuperAdmin) return true;

    return hasPermission(
      item.module,
      "read",
      item.moduleType
    );
  });

  const isRbacActive = rbacNavigation.some(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
  );

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col self-start overflow-hidden border-r border-gray-800 bg-gray-950 text-gray-300">

      {/* Sidebar Header */}
      <div className="flex h-[80px] shrink-0 flex-col justify-center border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">
          MobileShop
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          ERP Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Workspace
        </p>

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            pathname === "/dashboard"
              ? "bg-blue-600 font-medium text-white"
              : "hover:bg-gray-900 hover:text-white"
          }`}
        >
          <span className="w-5 text-center">▦</span>
          Dashboard
        </Link>

        {/* Permission Based Menus */}
        {visibleNavigation.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue-600 font-medium text-white"
                  : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              <span className="w-5 text-center">
                {item.icon}
              </span>

              {item.label}
            </Link>
          );
        })}

        {/* Attendance Management - Super Admin Only */}
        {isSuperAdmin && (
          <Link
            href="/dashboard/attendance"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              pathname === "/dashboard/attendance"
                ? "bg-blue-600 font-medium text-white"
                : "hover:bg-gray-900 hover:text-white"
            }`}
          >
            <span className="w-5 text-center">▦</span>
            Attendance Management
          </Link>
        )}

        {/* RBAC - Super Admin Only */}
        {isSuperAdmin && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setRbacOpen((open) => !open)}
              aria-expanded={rbacOpen}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                isRbacActive
                  ? "bg-blue-600 font-medium text-white"
                  : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-center">⚿</span>
                RBAC
              </span>

              <span className="text-xs">
                {rbacOpen ? "▲" : "▼"}
              </span>
            </button>

            {rbacOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l border-gray-800 pl-3">
                {rbacNavigation.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                        active
                          ? "bg-blue-600 font-medium text-white"
                          : "text-gray-400 hover:bg-gray-900 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Sign Out */}
      <div className="shrink-0 border-t border-gray-800 bg-gray-950 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-400 hover:bg-gray-900 hover:text-white"
        >
          ↪ Sign out
        </button>
      </div>
    </aside>
  );
}
