import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";

const stats = [
  {
    title: "Total Sales",
    value: "₹0",
    description: "Sales summary will appear here",
    icon: "₹",
  },
  {
    title: "Total Products",
    value: "0",
    description: "Products in your inventory",
    icon: "▣",
  },
  {
    title: "Customers",
    value: "0",
    description: "Registered shop customers",
    icon: "♙",
  },
  {
    title: "Active Repairs",
    value: "0",
    description: "Jobs awaiting completion",
    icon: "⚙",
  },
];

const quickLinks = [
  { label: "Add Product", href: "/products", icon: "+" },
  { label: "Create Sale", href: "/sales", icon: "₹" },
  { label: "Add Customer", href: "/customers", icon: "♙" },
  { label: "View Attendance", href: "/attendance", icon: "◷" },
];

export default function DashboardContent() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your mobile shop management workspace.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl font-semibold text-blue-700">
                {item.icon}
              </span>

              <div>
                <p className="font-semibold text-gray-900">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Open module
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Low Stock Products
            </h2>
            <Link
              href="/stock"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View stock
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 px-4 py-8 text-center">
            <p className="font-medium text-gray-700">
              No inventory data loaded
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Connect the product API to display low-stock items.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Recent Sales
            </h2>
            <Link
              href="/sales"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View sales
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 px-4 py-8 text-center">
            <p className="font-medium text-gray-700">
              No sales data loaded
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Connect the sales API to display recent transactions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}