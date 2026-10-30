
"use client";

import { useEffect, useRef, useState } from "react";

interface SelfieCaptureProps {
  onCapture: (image: Blob | null) => void;
}

export default function SelfieCapture({
  onCapture,
}: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera is unavailable. Please use localhost or HTTPS.",
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!cancelled) {
          setCameraReady(true);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to access the camera. Allow camera permission and retry.",
          );
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  function captureSelfie() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || !cameraReady) {
      setError("Camera is not ready. Please wait and try again.");
      return;
    }

    setCapturing(true);
    setError("");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to capture selfie. Please try again.");
      setCapturing(false);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setCapturing(false);

        if (!blob) {
          setError("Failed to capture selfie. Please try again.");
          return;
        }

        setCapturedImage((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return URL.createObjectURL(blob);
        });

        onCapture(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  function retakeSelfie() {
    setCapturedImage(null);
    onCapture(null);
    setError("");
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured attendance selfie"
            className="h-72 w-full object-cover sm:h-96"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-72 w-full object-cover sm:h-96"
            />

            {!cameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-sm text-white">
                Starting camera...
              </div>
            )}
          </>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
          {capturedImage ? "Selfie preview" : "Live camera"}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {capturedImage && (
        <p className="text-sm font-medium text-emerald-700">
          Selfie captured. Review your photo before submitting.
        </p>
      )}

      {capturedImage ? (
        <button
          type="button"
          onClick={retakeSelfie}
          className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Retake Selfie
        </button>
      ) : (
        <button
          type="button"
          onClick={captureSelfie}
          disabled={!cameraReady || capturing}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {capturing ? "Capturing..." : "Capture Selfie"}
        </button>
      )}
    </div>
  );
}
