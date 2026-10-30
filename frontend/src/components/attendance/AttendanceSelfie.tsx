"use client";

import { useState } from "react";
import SelfieCapture from "@/components/attendance/SelfieCapture";
import { apiRequest } from "@/lib/api";

interface AttendanceSelfieProps {
  token: string;
  mode: "check-in" | "check-out";
}

interface AttendanceResponse {
  message?: string;
}

export default function AttendanceSelfie({
  token,
  mode,
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
      setMessage(
        "Geolocation is not supported by this browser.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
            },
          );
        },
      );

      const formData = new FormData();

      formData.append(
        "selfie",
        selfie,
        "attendance-selfie.jpg",
      );

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
    } catch (error) {
      if (
        error instanceof GeolocationPositionError
      ) {
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
    <section className="space-y-4 rounded-xl border p-5">
      <h2 className="text-xl font-semibold">
        {mode === "check-in"
          ? "Staff Check-in"
          : "Staff Check-out"}
      </h2>

      <SelfieCapture onCapture={setSelfie} />

      {selfie && (
        <p className="text-sm text-green-600">
          Selfie captured successfully.
        </p>
      )}

      <button
        type="button"
        onClick={submitAttendance}
        disabled={loading || !selfie}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : mode === "check-in"
            ? "Submit Check-in"
            : "Submit Check-out"}
      </button>

      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
