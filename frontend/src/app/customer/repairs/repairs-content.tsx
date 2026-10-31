
"use client";

import { useEffect, useState } from "react";
import { Wrench, Smartphone } from "lucide-react";

import { apiRequest } from "@/lib/api";

interface Repair {
  _id: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  issue: string;
  estimatedCost: number;
  status:
    | "received"
    | "in_progress"
    | "ready"
    | "delivered"
    | "cancelled";
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Repair[];
}

export default function MyRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await apiRequest<ApiResponse>(
          "/customer/my-repairs",
        );

        setRepairs(response.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load repairs",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-50 text-blue-700";

      case "in_progress":
        return "bg-yellow-50 text-yellow-700";

      case "ready":
        return "bg-green-50 text-green-700";

      case "delivered":
        return "bg-gray-100 text-gray-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Repairs
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track your device repair services and status.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
            <Wrench size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Repair History
            </h2>

            <p className="text-xs text-gray-500">
              {repairs.length} total repairs
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading your repairs...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : repairs.length === 0 ? (
          <div className="p-12 text-center">
            <Smartphone
              size={36}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-4 font-semibold text-gray-800">
              No repairs found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Your device repair details will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {repairs.map((repair) => (
              <div
                key={repair._id}
                className="space-y-4 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {repair.deviceBrand} {repair.deviceModel}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Repair ID: {repair._id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                      repair.status,
                    )}`}
                  >
                    {repair.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Reported Issue
                    </p>

                    <p className="mt-1 text-sm text-gray-800">
                      {repair.issue}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Estimated Cost
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      ₹{Number(repair.estimatedCost).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {repair.imei && (
                    <div>
                      <p className="text-xs text-gray-500">
                        IMEI
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {repair.imei}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500">
                      Received Date
                    </p>

                    <p className="mt-1 text-sm text-gray-800">
                      {formatDate(repair.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
