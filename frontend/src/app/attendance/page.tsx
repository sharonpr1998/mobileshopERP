
"use client";

import { useState } from "react";
import AttendanceSelfie from "@/components/attendance/AttendanceSelfie";
import { useAuth } from "@/context/AuthContext";

type AttendanceMode = "check-in" | "check-out";

export default function AttendancePage() {
  const { token, loading } = useAuth();
  const [mode, setMode] = useState<AttendanceMode>("check-in");

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-sm text-slate-500">
          Loading attendance...
        </p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8">
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
        {/* Page heading */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              WORKSPACE / ATTENDANCE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Staff Attendance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Record your attendance securely using a selfie
              and your current location.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">
              Attendance portal
            </span>
          </div>
        </header>

        {/* Instructions */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📷
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">
              Capture selfie
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Capture a clear photo before submitting attendance.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
              📍
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">
              Verify location
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Allow browser location access and follow the shop
              location policy.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
              🕒
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">
              Record working hours
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Submit check-in and check-out using the attendance
              controls below.
            </p>
          </div>
        </section>

        {/* Attendance controls */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-7">
            <h2 className="text-xl font-bold text-slate-900">
              Record attendance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the action you want to perform.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setMode("check-in")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  mode === "check-in"
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Check-in
              </button>

              <button
                type="button"
                onClick={() => setMode("check-out")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  mode === "check-out"
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Check-out
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-7">
            <div className="mx-auto max-w-2xl">
              <AttendanceSelfie
                key={mode}
                token={token}
                mode={mode}
              />
            </div>
          </div>
        </section>

        {/* Security note */}
        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Attendance security
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-800">
              Location validation is enforced by the backend.
              Selfie capture alone does not confirm a person&apos;s
              identity; face verification must be implemented and
              validated separately.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
