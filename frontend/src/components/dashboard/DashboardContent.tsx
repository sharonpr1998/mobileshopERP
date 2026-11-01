"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type AttendanceRecord = {
  dateKey?: string;
  checkInAt?: string;
  checkOutAt?: string | null;
  workedMinutes?: number;
  overtimeMinutes?: number;
};

type AttendanceApiResponse = {
  data?: AttendanceRecord[] | { data?: AttendanceRecord[] };
};

type AttendanceSummaryData = {
  checkInAt: string;
  checkOutAt: string | null;
  workedMinutes: number;
  overtimeMinutes: number;
};

type DashboardRow = {
  name?: string;
  sku?: string;
  stockQuantity?: number;
  invoiceNumber?: string;
  customerName?: string;
  supplierName?: string;
  totalAmount?: number;
  createdAt?: string;
  status?: string;
  deviceBrand?: string;
  deviceModel?: string;
};

type DashboardData = {
  overview: {
    totalSales: number;
    totalRevenue: number;
    todayRevenue: number;
    todaySalesCount: number;
    monthlySalesCount: number;
    monthlyRevenue?: number;
  };
  inventory: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockUnits: number;
    inventoryPurchaseValue: number;
    lowStockLimit: number;
  };
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
  repairs: {
    total: number;
    received: number;
    inProgress: number;
    ready: number;
    delivered: number;
    cancelled: number;
  };
  purchases: {
    total: number;
    todayAmount: number;
    todayCount: number;
    monthlyAmount: number;
    monthlyCount: number;
  };
  staff: {
    total: number;
    active: number;
    inactive: number;
    blocked: number;
  };
  attendance: {
    present: number;
    notCheckedIn: number;
    currentlyWorking: number;
    checkedOut: number;
    totalWorkingMinutes: number;
    records?: Array<Record<string, unknown>>;
  };
  recentSales: DashboardRow[];
  recentPurchases: DashboardRow[];
  recentRepairs: DashboardRow[];
  lowStockList: DashboardRow[];
};

const quickLinks = [
  { label: "Add Product", href: "/products", icon: "+" },
  { label: "Create Sale", href: "/sales", icon: "₹" },
  { label: "Add Customer", href: "/customers", icon: "♙" },
  { label: "View Attendance", href: "/attendance", icon: "◷" },
];

const staffLinks = [
  {
    label: "Products",
    href: "/products",
    icon: "▣",
    module: "inventory",
    action: "read",
    moduleType: "master",
  },
  {
    label: "Create Sale",
    href: "/sales",
    icon: "₹",
    module: "sales",
    action: "create",
    moduleType: "transaction",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "♙",
    module: "customer",
    action: "read",
    moduleType: "master",
  },
  {
    label: "Repairs",
    href: "/repairs",
    icon: "⚙",
    module: "repair",
    action: "read",
    moduleType: "transaction",
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: "◷",
    module: "attendance",
    action: "read",
    moduleType: "transaction",
  },
  {
    label: "Staff Management",
    href: "/staff",
    icon: "♟",
    module: "staff",
    action: "read",
    moduleType: "master",
  },
];

function getTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function formatTime(value: string | null) {
  if (!value) return "Pending";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}h ${String(
    remainingMinutes,
  ).padStart(2, "0")}m`;
}

function getWorkedMinutes(record: AttendanceRecord) {
  if (record.checkOutAt) {
    if (typeof record.workedMinutes === "number") {
      return record.workedMinutes;
    }

    if (record.checkInAt) {
      return Math.max(
        0,
        Math.floor(
          (new Date(record.checkOutAt).getTime() -
            new Date(record.checkInAt).getTime()) /
            60000,
        ),
      );
    }

    return 0;
  }

  if (!record.checkInAt) return 0;

  return Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(record.checkInAt).getTime()) / 60000,
    ),
  );
}

function AttendanceSummary({ token }: { token: string }) {
  const [attendance, setAttendance] =
    useState<AttendanceSummaryData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiRequest<AttendanceApiResponse>("/attendance/my", {
      method: "GET",
      token,
    })
      .then((result) => {
        if (cancelled) return;

        const responseData = result.data;

        const records = Array.isArray(responseData)
          ? responseData
          : responseData?.data ?? [];

        const todayKey = getTodayKey();

        const todayRecord = records.find((record) => {
          if (record.dateKey) {
            return record.dateKey === todayKey;
          }

          if (record.checkInAt) {
            return (
              new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
              }).format(new Date(record.checkInAt)) === todayKey
            );
          }

          return false;
        });

        if (!todayRecord?.checkInAt) {
          setAttendance(null);
          return;
        }

        const workedMinutes = getWorkedMinutes(todayRecord);

        const overtimeMinutes =
          typeof todayRecord.overtimeMinutes === "number" &&
          todayRecord.checkOutAt
            ? todayRecord.overtimeMinutes
            : Math.max(0, workedMinutes - 480);

        setAttendance({
          checkInAt: todayRecord.checkInAt,
          checkOutAt: todayRecord.checkOutAt ?? null,
          workedMinutes,
          overtimeMinutes,
        });

        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const completed = Boolean(attendance?.checkOutAt);

  const progress = attendance
    ? Math.min((attendance.workedMinutes / 480) * 100, 100)
    : 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            My Attendance
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your attendance summary for today.
          </p>
        </div>

        <Link
          href="/attendance"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View Attendance →
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading attendance...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>

          <p className="mt-1 text-xs text-red-600">
            Please check your attendance permission.
          </p>
        </div>
      ) : !attendance ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                Not Checked In
              </p>

              <p className="mt-1 text-sm text-gray-500">
                You have not marked your attendance today.
              </p>
            </div>

            <Link
              href="/attendance"
              className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Check In Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">
                Today's Attendance
              </p>

              <h3 className="mt-1 text-lg font-bold text-gray-900">
                {completed
                  ? "Attendance Completed"
                  : "Currently Working"}
              </h3>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {completed ? "Completed" : "Checked In"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Check-in Time", formatTime(attendance.checkInAt)],
              ["Check-out Time", formatTime(attendance.checkOutAt)],
              ["Working Hours", formatDuration(attendance.workedMinutes)],
              ["Overtime", formatDuration(attendance.overtimeMinutes)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg bg-gray-50 p-4"
              >
                <p className="text-xs text-gray-500">{label}</p>

                <p className="mt-2 text-lg font-bold text-gray-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                8-hour work progress
              </span>

              <span className="text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!completed && (
            <div className="mt-5 flex flex-col gap-3 rounded-lg bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-blue-800">
                Remember to complete your attendance using check-out.
              </p>

              <Link
                href="/attendance"
                className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Check Out
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StaffDashboard() {
  const { user, token, hasPermission } = useAuth();

  const visibleLinks = staffLinks.filter((item) =>
    hasPermission(item.module, item.action, item.moduleType),
  );

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name || "Staff"}!
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Welcome to your staff workspace.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Account Name</p>

          <h2 className="mt-2 text-lg font-semibold text-gray-900">
            {user?.name}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Email Address</p>

          <h2 className="mt-2 break-all text-sm font-semibold text-gray-900">
            {user?.email}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Account Role</p>

          <h2 className="mt-2 text-lg font-semibold capitalize text-blue-600">
            {user?.role?.replace("_", " ")}
          </h2>
        </div>
      </section>

      {token && <AttendanceSummary token={token} />}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          My Workspace
        </h2>

        {visibleLinks.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            No modules have been assigned to your account yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleLinks.map((item) => (
              <Link
                key={item.href}
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
        )}
      </section>

      <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="font-semibold text-blue-900">
          Work Reminder
        </h2>

        <p className="mt-2 text-sm text-blue-800">
          Use the modules assigned to your account to manage your daily shop activities.
        </p>
      </section>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl font-bold text-blue-600">
          {icon}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        {value}
      </h2>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function OverviewPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-gray-900">
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-gray-500">
              {item.label}
            </span>

            <span className="font-semibold text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTable({
  title,
  href,
  rows,
  kind,
}: {
  title: string;
  href: string;
  rows: DashboardRow[];
  kind: "sales" | "purchases" | "repairs";
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">
          {title}
        </h2>

        <Link
          href={href}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all →
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="py-7 text-center text-sm text-gray-500">
          No records available yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">
                  {kind === "repairs" ? "Device" : "Reference"}
                </th>

                <th className="p-3">
                  {kind === "sales"
                    ? "Customer"
                    : kind === "purchases"
                      ? "Supplier"
                      : "Status"}
                </th>

                <th className="p-3">
                  {kind === "repairs" ? "Date" : "Amount"}
                </th>

                {kind !== "repairs" && (
                  <th className="p-3">Date</th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.invoiceNumber ?? row.name ?? "row"}-${index}`}
                  className="border-b last:border-0"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {kind === "repairs"
                      ? `${row.deviceBrand ?? ""} ${row.deviceModel ?? ""}`.trim() || "Repair"
                      : row.invoiceNumber ?? "—"}
                  </td>

                  <td className="p-3 text-gray-600">
                    {kind === "sales"
                      ? row.customerName ?? "Walk-in Customer"
                      : kind === "purchases"
                        ? row.supplierName ?? "—"
                        : row.status ?? "—"}
                  </td>

                  <td className="p-3 text-gray-700">
                    {kind === "repairs"
                      ? formatDate(row.createdAt)
                      : formatCurrency(row.totalAmount ?? 0)}
                  </td>

                  {kind !== "repairs" && (
                    <td className="p-3 text-gray-500">
                      {formatDate(row.createdAt)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AdminDashboard() {
  const { user, token } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in as Super Admin to view dashboard statistics.");
      return;
    }

    let cancelled = false;

    apiRequest<{ data: DashboardData }>("/dashboard", {
      method: "GET",
      token,
    })
      .then((result) => {
        if (cancelled) return;

        setDashboard(result.data);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        Loading Super Admin dashboard...
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-800">
          Dashboard data unavailable
        </h2>

        <p className="mt-1 text-sm text-red-700">
          {error || "No dashboard data received."}
        </p>

        <p className="mt-2 text-xs text-red-600">
          Check the dashboard API response and your Super Admin access.
        </p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Sales",
      value: dashboard.overview.totalSales,
      description: `${dashboard.overview.monthlySalesCount} sales this month`,
      icon: "₹",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(
        dashboard.overview.monthlyRevenue ??
          dashboard.overview.totalRevenue,
      ),
      description: `Today: ${formatCurrency(dashboard.overview.todayRevenue)}`,
      icon: "↗",
    },
    {
      title: "Total Products",
      value: dashboard.inventory.totalProducts,
      description: `${dashboard.inventory.totalStockUnits} units in stock`,
      icon: "▣",
    },
    {
      title: "Total Customers",
      value: dashboard.customers.total,
      description: `${dashboard.customers.active} active customers`,
      icon: "♙",
    },
  ];

  const panels = [
    {
      title: "Inventory Overview",
      items: [
        {
          label: "Active Products",
          value: dashboard.inventory.activeProducts,
        },
        {
          label: "Low Stock",
          value: dashboard.inventory.lowStockProducts,
        },
        {
          label: "Out of Stock",
          value: dashboard.inventory.outOfStockProducts,
        },
        {
          label: "Stock Units",
          value: dashboard.inventory.totalStockUnits,
        },
      ],
    },
    {
      title: "Customer Overview",
      items: [
        {
          label: "Total Customers",
          value: dashboard.customers.total,
        },
        {
          label: "Active Customers",
          value: dashboard.customers.active,
        },
        {
          label: "Inactive Customers",
          value: dashboard.customers.inactive,
        },
      ],
    },
    {
      title: "Staff Overview",
      items: [
        {
          label: "Total Staff",
          value: dashboard.staff.total,
        },
        {
          label: "Active Staff",
          value: dashboard.staff.active,
        },
        {
          label: "Inactive Staff",
          value: dashboard.staff.inactive,
        },
        {
          label: "Blocked Staff",
          value: dashboard.staff.blocked,
        },
      ],
    },
    {
      title: "Repair Overview",
      items: [
        {
          label: "Total Repairs",
          value: dashboard.repairs.total,
        },
        {
          label: "Received",
          value: dashboard.repairs.received,
        },
        {
          label: "In Progress",
          value: dashboard.repairs.inProgress,
        },
        {
          label: "Ready",
          value: dashboard.repairs.ready,
        },
        {
          label: "Delivered",
          value: dashboard.repairs.delivered,
        },
        {
          label: "Cancelled",
          value: dashboard.repairs.cancelled,
        },
      ],
    },
    {
      title: "Today's Attendance",
      items: [
        {
          label: "Present",
          value: dashboard.attendance.present,
        },
        {
          label: "Not Checked In",
          value: dashboard.attendance.notCheckedIn,
        },
        {
          label: "Currently Working",
          value: dashboard.attendance.currentlyWorking,
        },
        {
          label: "Checked Out",
          value: dashboard.attendance.checkedOut,
        },
        {
          label: "Working Hours",
          value: formatDuration(
            dashboard.attendance.totalWorkingMinutes,
          ),
        },
      ],
    },
    {
      title: "Purchase Overview",
      items: [
        {
          label: "Total Purchases",
          value: dashboard.purchases.total,
        },
        {
          label: "Today's Purchases",
          value: dashboard.purchases.todayCount,
        },
        {
          label: "Today's Amount",
          value: formatCurrency(dashboard.purchases.todayAmount),
        },
        {
          label: "Monthly Purchases",
          value: dashboard.purchases.monthlyCount,
        },
        {
          label: "Monthly Amount",
          value: formatCurrency(dashboard.purchases.monthlyAmount),
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || "Super Admin"}!
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's your mobile shop business overview.
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
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Today's Sales Revenue
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(dashboard.overview.todayRevenue)}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {dashboard.overview.todaySalesCount} sales today
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Current Inventory Purchase Value
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(
              dashboard.inventory.inventoryPurchaseValue,
            )}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current stock quantity × purchase price
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Business Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {panels.map((panel) => (
            <OverviewPanel key={panel.title} {...panel} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
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
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">
              Low Stock Products
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Products at or below {dashboard.inventory.lowStockLimit} units
            </p>
          </div>

          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Products →
          </Link>
        </div>

        {dashboard.lowStockList.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No low-stock products.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.lowStockList.map((product, index) => {
                  const quantity = Number(
                    product.stockQuantity ?? 0,
                  );

                  return (
                    <tr
                      key={`${product.sku ?? product.name ?? "product"}-${index}`}
                      className="border-b last:border-0"
                    >
                      <td className="p-3 font-medium text-gray-900">
                        {product.name ?? "—"}
                      </td>

                      <td className="p-3 text-gray-500">
                        {product.sku ?? "—"}
                      </td>

                      <td className="p-3 font-semibold text-gray-900">
                        {quantity}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            quantity === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {quantity === 0
                            ? "Out of Stock"
                            : "Low Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentTable
          title="Recent Sales"
          href="/sales"
          rows={dashboard.recentSales}
          kind="sales"
        />

        <RecentTable
          title="Recent Purchases"
          href="/purchases"
          rows={dashboard.recentPurchases}
          kind="purchases"
        />

        <RecentTable
          title="Recent Repairs"
          href="/repairs"
          rows={dashboard.recentRepairs}
          kind="repairs"
        />
      </section>
    </div>
  );
}

export default function DashboardContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (user?.role?.toLowerCase() === "staff") {
    return <StaffDashboard />;
  }

  if (user?.role?.toLowerCase() === "customer") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">
          Customer Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please open your customer portal to view your orders and repairs.
        </p>
      </div>
    );
  }

  return <AdminDashboard />;
}