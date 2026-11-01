
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type UserInfo = {
  _id: string;
  name: string;
  email: string;
};

type AttendanceRecord = {
  _id: string;
  userId: UserInfo | string;
  dateKey: string;
  checkInAt: string;
  checkOutAt?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  checkInSelfieUrl?: string;
  checkOutSelfieUrl?: string;
  workedMinutes?: number | null;
  overtimeMinutes?: number | null;
  completed?: boolean;
};

type AttendanceResponse = {
  success: boolean;
  data: AttendanceRecord[];
};

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function formatTime(value?: string) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(value: string) {
  if (!value) return "--";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatDuration(minutes?: number | null) {
  if (minutes === null || minutes === undefined) return "--";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function getStaff(record: AttendanceRecord): UserInfo | null {
  return typeof record.userId === "object" ? record.userId : null;
}

function getWorkingMinutes(record: AttendanceRecord) {
  const start = new Date(record.checkInAt).getTime();

  const end = record.checkOutAt
    ? new Date(record.checkOutAt).getTime()
    : Date.now();

  if (Number.isNaN(start) || Number.isNaN(end)) return 0;

  return Math.max(0, Math.floor((end - start) / 60000));
}

export default function AttendanceManagementPage() {
  const { user, token } = useAuth();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [showAllDates, setShowAllDates] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  // Fetch attendance records
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchAttendance = async () => {
      try {
        const result = await apiRequest<AttendanceResponse>(
          "/attendance",
          {
            method: "GET",
            token,
          }
        );

        if (!isMounted) return;

        setAttendance(
          Array.isArray(result.data) ? result.data : []
        );

        setError("");
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load attendance records."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const isSuperAdmin =
    user?.role?.toLowerCase() === "super_admin";

  // Filter attendance records
  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const staff = getStaff(record);

      const matchesDate =
        showAllDates || record.dateKey === selectedDate;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        staff?.name?.toLowerCase().includes(searchText) ||
        staff?.email?.toLowerCase().includes(searchText);

      return matchesDate && matchesSearch;
    });
  }, [attendance, selectedDate, showAllDates, search]);

  // Summary calculations
  const presentCount = filteredAttendance.length;

  const currentlyWorkingCount = filteredAttendance.filter(
    (record) => !record.checkOutAt
  ).length;

  const checkedOutCount = filteredAttendance.filter(
    (record) => Boolean(record.checkOutAt)
  ).length;

  // Authentication check
  if (!token) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Please log in to view attendance records.
        </p>
      </div>
    );
  }

  // Role check
  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-700">
          Loading attendance records...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 text-gray-900 md:p-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-950">
          Attendance Management
        </h1>

        <p className="mt-1 text-sm text-gray-700">
          View and monitor staff attendance records.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            Present
          </p>

          <h2 className="mt-2 text-3xl font-bold text-black">
            {presentCount}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            Currently Working
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {currentlyWorkingCount}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            Checked Out
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {checkedOutCount}
          </h2>
        </div>
      </div>

      {/* Search and Date Filters */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 md:flex-row md:items-center md:justify-between">

        <input
          type="text"
          placeholder="Search staff name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-black placeholder:text-gray-500 outline-none focus:border-blue-600 md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-3">

          <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={showAllDates}
              onChange={(event) =>
                setShowAllDates(event.target.checked)
              }
              className="h-4 w-4 accent-blue-600"
            />

            Show all dates
          </label>

          {!showAllDates && (
            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black outline-none focus:border-blue-600"
            />
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px] text-left text-sm">

            <thead className="bg-gray-100 text-gray-950">

              <tr>
                <th className="px-5 py-4 font-bold">Staff</th>
                <th className="px-5 py-4 font-bold">Date</th>
                <th className="px-5 py-4 font-bold">Check In</th>
                <th className="px-5 py-4 font-bold">Check Out</th>
                <th className="px-5 py-4 font-bold">Working Hours</th>
                <th className="px-5 py-4 font-bold">Overtime</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold">Details</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200 text-gray-950">

              {filteredAttendance.map((record) => {
                const staff = getStaff(record);

                const workingMinutes =
                  getWorkingMinutes(record);

                const overtimeMinutes = record.checkOutAt
                  ? Math.max(0, workingMinutes - 480)
                  : 0;

                return (
                  <tr
                    key={record._id}
                    className="hover:bg-gray-50"
                  >

                    {/* Staff */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-black">
                        {staff?.name || "Unknown Staff"}
                      </p>

                      <p className="mt-1 text-xs text-gray-700">
                        {staff?.email || "--"}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 font-medium text-black">
                      {formatDate(record.dateKey)}
                    </td>

                    {/* Check In */}
                    <td className="px-5 py-4 font-medium text-black">
                      {formatTime(record.checkInAt)}
                    </td>

                    {/* Check Out */}
                    <td className="px-5 py-4 font-medium text-black">
                      {formatTime(record.checkOutAt)}
                    </td>

                    {/* Working Hours */}
                    <td className="px-5 py-4 font-medium text-black">
                      {formatDuration(workingMinutes)}
                    </td>

                    {/* Overtime */}
                    <td className="px-5 py-4 font-medium text-black">
                      {record.checkOutAt
                        ? formatDuration(overtimeMinutes)
                        : "--"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {record.checkOutAt ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                          Working
                        </span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="px-5 py-4">

                      <div className="flex flex-col gap-2">

                        {record.checkInSelfieUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImage(
                                record.checkInSelfieUrl || ""
                              )
                            }
                            className="text-left font-medium text-blue-700 hover:underline"
                          >
                            Check-in selfie
                          </button>
                        )}

                        {record.checkOutSelfieUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImage(
                                record.checkOutSelfieUrl || ""
                              )
                            }
                            className="text-left font-medium text-blue-700 hover:underline"
                          >
                            Check-out selfie
                          </button>
                        )}

                        {record.checkInLocation && (
                          <a
                            href={`https://www.google.com/maps?q=${record.checkInLocation.latitude},${record.checkInLocation.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-800 underline"
                          >
                            Check-in location
                          </a>
                        )}

                        {record.checkOutLocation && (
                          <a
                            href={`https://www.google.com/maps?q=${record.checkOutLocation.latitude},${record.checkOutLocation.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-800 underline"
                          >
                            Check-out location
                          </a>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}

              {/* Empty State */}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center font-medium text-gray-700"
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Selfie Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedImage("")}
        >

          <div
            className="relative max-h-[90vh] max-w-3xl rounded-xl bg-white p-3"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              onClick={() => setSelectedImage("")}
              className="absolute right-3 top-3 rounded-full bg-black/80 px-3 py-1 font-medium text-white"
            >
              Close
            </button>

            <img
              src={selectedImage}
              alt="Attendance selfie"
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />

          </div>
        </div>
      )}

    </div>
  );
}
