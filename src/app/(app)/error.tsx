"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium text-foreground">
        Terjadi kesalahan saat memuat halaman.
      </p>
      <p className="text-sm text-muted">
        Coba lagi dalam beberapa saat. Kalau berulang, periksa koneksi internetmu.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
      >
        Coba Lagi
      </button>
    </div>
  );
}
