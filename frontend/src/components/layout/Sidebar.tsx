
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Products", href: "/products", icon: "▣" },
  { label: "Categories", href: "/categories", icon: "▤" },
  { label: "Stock", href: "/stock", icon: "▥" },
  { label: "Purchases", href: "/purchases", icon: "↓" },
  { label: "Sales", href: "/sales", icon: "↑" },
  { label: "Customers", href: "/customers", icon: "♙" },
  { label: "Repairs", href: "/repairs", icon: "⚙" },
  { label: "Attendance", href: "/attendance", icon: "◷" },
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
  const { logout } = useAuth();

  const isRbacActive = rbacNavigation.some(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`),
  );

  const [rbacOpen, setRbacOpen] = useState(isRbacActive);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col self-start overflow-hidden border-r border-gray-800 bg-gray-950 text-gray-300">
      {/* Fixed Sidebar Header */}
      <div className="flex h-[80px] shrink-0 flex-col justify-center border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">
          MobileShop
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          ERP Management
        </p>
      </div>

      {/* Scrollable Menu - Scrollbar Hidden */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Workspace
        </p>

        {navigation.map((item) => {
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

        {/* RBAC Dropdown */}
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
      </nav>

      {/* Fixed Sign Out Footer */}
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
