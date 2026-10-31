"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Wrench,
  ArrowRight,
  Package,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Order {
  _id: string;
  invoiceNumber?: string;
  totalAmount: number;
  createdAt: string;
}

interface Repair {
  _id: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  status: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [orderResponse, repairResponse] = await Promise.all([
          apiRequest<ApiResponse<Order[]>>("/customer/my-orders"),
          apiRequest<ApiResponse<Repair[]>>("/customer/my-repairs"),
        ]);

        setOrders(orderResponse.data || []);
        setRepairs(repairResponse.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="font-medium text-red-700">
          Unable to load dashboard
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your orders and repair services in one place.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Orders
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                {orders.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShoppingBag size={25} />
            </div>
          </div>

          <Link
            href="/customer/orders"
            className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View orders
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Repairs
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                {repairs.length}
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Wrench size={25} />
            </div>
          </div>

          <Link
            href="/customer/repairs"
            className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View repairs
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">
              Recent Orders
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Your latest purchases
            </p>
          </div>

          <Link
            href="/customer/orders"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              size={30}
              className="mx-auto text-gray-400"
            />
            <p className="mt-3 text-sm font-medium text-gray-700">
              No orders found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your purchases will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.invoiceNumber || order._id}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Repairs */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">
              Recent Repairs
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Track your device repair services
            </p>
          </div>

          <Link
            href="/customer/repairs"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {repairs.length === 0 ? (
          <div className="p-10 text-center">
            <Wrench
              size={30}
              className="mx-auto text-gray-400"
            />
            <p className="mt-3 text-sm font-medium text-gray-700">
              No repairs found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your repair details will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {repairs.slice(0, 5).map((repair) => (
              <div
                key={repair._id}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {repair.deviceBrand} {repair.deviceModel}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {repair.issue}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                  {repair.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}