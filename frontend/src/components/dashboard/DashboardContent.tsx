
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";
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
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

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

        if (!todayRecord || !todayRecord.checkInAt) {
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
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Loading attendance...
          </p>
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
                {completed ? "Attendance Completed" : "Currently Working"}
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
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Check-in Time</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatTime(attendance.checkInAt)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Check-out Time</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatTime(attendance.checkOutAt)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Working Hours</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatDuration(attendance.workedMinutes)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Overtime</p>
              <p className="mt-2 text-lg font-bold text-orange-600">
                {formatDuration(attendance.overtimeMinutes)}
              </p>
            </div>
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

// Existing Super Admin Dashboard
function AdminDashboard() {
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

  return <AdminDashboard />;
}
