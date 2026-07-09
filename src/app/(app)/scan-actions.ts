"use server";

import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";

export interface ScanReceiptResult {
  error: string | null;
  amount?: number;
  description?: string;
  transactionDate?: string;
  categoryId?: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function scanReceipt(
  formData: FormData
): Promise<ScanReceiptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Gambar tidak ditemukan." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Ukuran gambar terlalu besar. Coba foto ulang." };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      error: "Fitur scan struk belum dikonfigurasi (OPENAI_API_KEY belum diset).",
    };
  }

  const categories = await getCategories();
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const categoryNames = expenseCategories.map((c) => c.name);

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");
  const mimeType = file.type || "image/jpeg";

  const systemPrompt = `Kamu adalah asisten yang membaca foto struk/nota belanja Indonesia dan mengubahnya menjadi data transaksi.
Balas HANYA dengan JSON valid (tanpa markdown, tanpa penjelasan), dengan bentuk persis:
{"amount": number, "date": "YYYY-MM-DD atau null", "description": string, "category": string atau null}

Ketentuan:
- amount: total belanja dalam Rupiah, angka murni tanpa titik/koma/simbol (contoh: 45000).
- date: tanggal transaksi pada struk dalam format YYYY-MM-DD. Jika tidak terbaca, gunakan null.
- description: nama toko/merchant, singkat, maksimal 50 karakter.
- category: pilih SATU nama yang PALING cocok dari daftar berikut (harus sama persis salah satu dari daftar, atau null jika tidak ada yang cocok): ${categoryNames.join(", ")}.

Jika gambar bukan struk/nota belanja atau tidak bisa dibaca sama sekali, balas dengan: {"error": "alasan singkat dalam Bahasa Indonesia"}.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Baca struk pada gambar ini dan ekstrak datanya sesuai format yang diminta." },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI scan error:", response.status, errText);
      if (response.status === 401) {
        return { error: "API key OpenAI tidak valid." };
      }
      if (response.status === 429) {
        return { error: "Kuota/limit OpenAI habis, coba lagi nanti." };
      }
      return { error: "Gagal menghubungi layanan scan. Coba lagi." };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return { error: "Tidak ada hasil dari scan." };

    let parsed: {
      amount?: unknown;
      date?: unknown;
      description?: unknown;
      category?: unknown;
      error?: unknown;
    };
    try {
      parsed = JSON.parse(content);
    } catch {
      return { error: "Gagal membaca hasil scan. Coba foto yang lebih jelas." };
    }

    if (parsed.error) {
      return { error: String(parsed.error) };
    }

    const amountNum =
      typeof parsed.amount === "number"
        ? parsed.amount
        : Number(String(parsed.amount ?? "").replace(/[^\d]/g, ""));

    const matchedCategory = expenseCategories.find(
      (c) => c.name.toLowerCase() === String(parsed.category ?? "").toLowerCase()
    );

    return {
      error: null,
      amount: Number.isFinite(amountNum) && amountNum > 0 ? amountNum : undefined,
      description:
        typeof parsed.description === "string" && parsed.description.trim()
          ? parsed.description.trim().slice(0, 100)
          : undefined,
      transactionDate:
        typeof parsed.date === "string" && DATE_RE.test(parsed.date)
          ? parsed.date
          : undefined,
      categoryId: matchedCategory?.id ?? null,
    };
  } catch (err) {
    console.error("Scan receipt error:", err);
    return { error: "Terjadi kesalahan saat memproses gambar." };
  }
}
