"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error: string | null;
  success?: string | null;
}

const errorMessages: Record<string, string> = {
  "Invalid login credentials": "Email atau password salah.",
  "User already registered": "Email ini sudah terdaftar. Coba masuk.",
  "Email not confirmed": "Silakan cek email untuk konfirmasi akun dulu.",
};

function translateError(message: string): string {
  return errorMessages[message] ?? message;
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateError(error.message) };
  }

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: translateError(error.message) };
  }

  if (data.session) {
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
}
