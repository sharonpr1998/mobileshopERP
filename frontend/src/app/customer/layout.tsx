"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  UserRound,
  LogOut,
  Smartphone,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const navigation = [
  {
    name: "Overview",
    href: "/customer",
    icon: LayoutDashboard,
  },
  {
    name: "My Orders",
    href: "/customer/orders",
    icon: ShoppingBag,
  },
  {
    name: "My Repairs",
    href: "/customer/repairs",
    icon: Wrench,
  },
  {
    name: "My Profile",
    href: "/customer/profile",
    icon: UserRound,
  },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isCustomer = user?.role?.toLowerCase() === "customer";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isCustomer) {
      router.replace("/dashboard");
    }
  }, [loading, user, isCustomer, router]);

  if (loading || !user || !isCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading customer portal...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b border-gray-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Smartphone size={21} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Mobile ERP
            </h1>
            <p className="text-xs text-gray-500">
              Customer Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/customer" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User and Logout */}
        <div className="hidden border-t border-gray-100 p-4 md:block">
          <div className="mb-3">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">
              {user.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 md:ml-64">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5 md:px-8">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Welcome back,
            </p>
            <h2 className="text-base font-semibold text-gray-900">
              {user.name}
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 md:hidden"
          >
            <LogOut size={17} />
            Logout
          </button>
        </header>

        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}