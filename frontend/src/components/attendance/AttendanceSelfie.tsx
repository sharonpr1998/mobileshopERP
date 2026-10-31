
"use client";

import { useState } from "react";
import SelfieCapture from "@/components/attendance/SelfieCapture";
import { apiRequest } from "@/lib/api";

interface AttendanceSelfieProps {
  token: string;
  mode: "check-in" | "check-out";
  onSuccess: () => void;
}

interface AttendanceResponse {
  message?: string;
}

export default function AttendanceSelfie({
  token,
  mode,
  onSuccess,
}: AttendanceSelfieProps) {
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitAttendance() {
    if (!selfie) {
      setMessage("Please capture a selfie first.");
      return;
    }

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        },
      );

      const formData = new FormData();

      formData.append("selfie", selfie, "attendance-selfie.jpg");

      formData.append(
        "location",
        JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      );

      const result = await apiRequest<AttendanceResponse>(
        `/attendance/${mode}`,
        {
          method: mode === "check-in" ? "POST" : "PATCH",
          token,
          body: formData,
        },
      );

      setMessage(
        result.message || "Attendance recorded successfully.",
      );

      setSelfie(null);

      // Move to the next attendance screen only after API success.
      onSuccess();
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          setMessage(
            "Location permission denied. Please allow location access.",
          );
        } else if (error.code === error.TIMEOUT) {
          setMessage(
            "Location request timed out. Please try again.",
          );
        } else {
          setMessage("Unable to get your location.");
        }
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to submit attendance.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          {mode === "check-in" ? "Capture Check-in Selfie" : "Capture Check-out Selfie"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Position your face clearly inside the camera frame.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
        <SelfieCapture onCapture={setSelfie} />
      </div>

      {selfie && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
          <span className="text-emerald-600">✓</span>
          <p className="text-sm font-medium text-emerald-700">
            Selfie captured successfully. You can retake it if needed.
          </p>
        </div>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={submitAttendance}
        disabled={loading || !selfie}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Verifying location and submitting...
          </>
        ) : mode === "check-in" ? (
          "Confirm Check-in"
        ) : (
          "Confirm Check-out"
        )}
      </button>
    </section>
  );
}
