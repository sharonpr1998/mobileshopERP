"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Package } from "lucide-react";

import { apiRequest } from "@/lib/api";

interface Order {
  _id: string;
  invoiceNumber?: string;
  customerName?: string;
  totalAmount: number;
  createdAt: string;
  items?: {
    productName?: string;
    quantity: number;
    price: number;
  }[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiRequest<ApiResponse>(
          "/customer/my-orders",
        );

        setOrders(response.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load orders",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View your purchase history and order details.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <ShoppingBag size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Order History
            </h2>
            <p className="text-xs text-gray-500">
              {orders.length} total orders
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package
              size={36}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-4 font-semibold text-gray-800">
              No orders found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Your purchases will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Invoice
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Date
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {order.invoiceNumber || order._id}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}