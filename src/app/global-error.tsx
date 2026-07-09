"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "24px",
            textAlign: "center",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <p style={{ fontWeight: 600 }}>Terjadi kesalahan pada aplikasi.</p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Coba muat ulang halaman. Kalau masih terjadi, coba lagi nanti.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "8px",
              borderRadius: "12px",
              backgroundColor: "#0f6e57",
              color: "#fff",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
