
"use client";

import { useState } from "react";
import AttendanceSelfie from "@/components/attendance/AttendanceSelfie";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { useEffect } from "react";

type AttendanceMode = "check-in" | "check-out" | "completed";

interface AttendanceRecord {
  dateKey?: string;
  checkInAt?: string;
  checkOutAt?: string | null;
}

interface AttendanceApiResponse {
  data?: AttendanceRecord[] | { data?: AttendanceRecord[] };
}

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

function AttendanceStatus({
  token,
  onStatusLoaded,
}: {
  token: string;
  onStatusLoaded: (mode: AttendanceMode) => void;
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAttendance() {
      try {
        const result = await apiRequest<AttendanceApiResponse>(
          "/attendance/my",
          {
            method: "GET",
            token,
          },
        );

        if (controller.signal.aborted) return;

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
            const recordDate = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Kolkata",
            }).format(new Date(record.checkInAt));

            return recordDate === todayKey;
          }

          return false;
        });

        if (!todayRecord) {
          onStatusLoaded("check-in");
        } else if (todayRecord.checkOutAt) {
          onStatusLoaded("completed");
        } else {
          onStatusLoaded("check-out");
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance status.",
        );
      }
    }

    void fetchAttendance();

    return () => controller.abort();
  }, [token, onStatusLoaded]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <p className="text-sm text-slate-500">
        Checking today's attendance...
      </p>
    </div>
  );
}

export default function AttendancePage() {
  const { token, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<AttendanceMode | null>(null);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        Loading...
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            Login required
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please log in to access staff attendance.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <header>
          <p className="text-sm font-semibold text-blue-600">
            WORKSPACE / ATTENDANCE
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Staff Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Securely record your attendance using selfie and GPS verification.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-7">
            <h2 className="text-xl font-bold text-slate-900">
              {mode === null
                ? "Checking Attendance"
                : mode === "check-in"
                  ? "Staff Check-in"
                  : mode === "check-out"
                    ? "Staff Check-out"
                    : "Attendance Completed"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {mode === "check-in"
                ? "Capture your selfie to start your workday."
                : mode === "check-out"
                  ? "Capture your selfie to finish your workday."
                  : mode === "completed"
                    ? "You have completed today's attendance."
                    : "Please wait while we check your attendance."}
            </p>
          </div>

          <div className="p-4 sm:p-7">
            <div className="mx-auto max-w-2xl">
              {mode === null ? (
                <AttendanceStatus
                  key={token}
                  token={token}
                  onStatusLoaded={setMode}
                />
              ) : mode === "completed" ? (
                <div className="rounded-2xl bg-emerald-50 px-6 py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
                    ✓
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-emerald-900">
                    Attendance Completed!
                  </h3>

                  <p className="mt-2 text-sm text-emerald-800">
                    Your check-in and check-out have both been recorded for today.
                  </p>
                </div>
              ) : (
                <AttendanceSelfie
                  key={mode}
                  token={token}
                  mode={mode}
                  onSuccess={() => {
                    setMode(
                      mode === "check-in" ? "check-out" : "completed",
                    );
                  }}
                />
              )}
            </div>
          </div>
        </section>

        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Attendance security
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-800">
              GPS location and selfie are required for both check-in and
              check-out. Location validation is performed by the backend.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
