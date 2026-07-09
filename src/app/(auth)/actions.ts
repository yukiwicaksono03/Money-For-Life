"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error: string | null;
  success?: string | null;
}

const errorMessages: Record<string, string> = {
  "Invalid login credentials": "Email atau password salah.",
  "User already registered": "Email ini sudah terdaftar. Coba masuk.",
  "Email not confirmed": "Silakan cek email untuk konfirmasi akun dulu.",
  "Email rate limit exceeded": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  "Signups not allowed for this instance": "Pendaftaran akun baru sedang dinonaktifkan.",
};

function translateError(message: string): string {
  return errorMessages[message] ?? message;
}

async function getSiteOrigin(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  if (origin) return origin;

  const host = headersList.get("host");
  if (host) {
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let errorMessage: string | null = null;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) errorMessage = translateError(error.message);
  } catch (err) {
    console.error("signIn unexpected error:", err);
    errorMessage = "Tidak bisa terhubung ke server. Coba lagi dalam beberapa saat.";
  }

  if (errorMessage) return { error: errorMessage };

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  let errorMessage: string | null = null;
  let hasSession = false;
  try {
    const supabase = await createClient();
    const origin = await getSiteOrigin();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      errorMessage = translateError(error.message);
    } else {
      hasSession = Boolean(data.session);
    }
  } catch (err) {
    console.error("signUp unexpected error:", err);
    errorMessage = "Tidak bisa terhubung ke server. Coba lagi dalam beberapa saat.";
  }

  if (errorMessage) return { error: errorMessage };

  if (hasSession) {
    redirect("/dashboard");
  }

  return {
    error: null,
    success: "Akun berhasil dibuat! Cek email kamu untuk konfirmasi sebelum masuk.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
