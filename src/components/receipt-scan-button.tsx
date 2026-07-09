"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { scanReceipt } from "@/app/(app)/scan-actions";

export interface ScanResultData {
  amount?: number;
  description?: string;
  transactionDate?: string;
  categoryId?: string | null;
}

// Downscale + re-encode client-side before upload so the request is small
// and fast. Uses FileReader/Image/Canvas only (no createImageBitmap) to stay
// compatible with older Safari.
function resizeImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak didukung di browser ini."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal memproses gambar."));
              return;
            }
            resolve(new File([blob], "receipt.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

export function ReceiptScanButton({
  onScanned,
}: {
  onScanned: (data: ScanResultData) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setScanning(true);
    try {
      const resized = await resizeImage(file);
      const formData = new FormData();
      formData.append("image", resized);
      const result = await scanReceipt(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (!result.amount && !result.description && !result.transactionDate) {
        setError("Tidak ada data yang bisa dibaca dari struk ini. Isi manual ya.");
        return;
      }

      onScanned({
        amount: result.amount,
        description: result.description,
        transactionDate: result.transactionDate,
        categoryId: result.categoryId,
      });
    } catch {
      setError("Gagal memproses gambar. Coba lagi.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={scanning}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft px-4 py-2.5 text-sm font-medium text-primary transition-opacity disabled:opacity-70"
      >
        {scanning ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Membaca struk...
          </>
        ) : (
          <>
            <Camera size={16} />
            Scan Struk dengan Kamera
          </>
        )}
      </button>
      {error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
