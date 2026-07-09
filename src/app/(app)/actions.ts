"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  error: string | null;
}

export async function addTransaction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const type = String(formData.get("type") ?? "expense") as
    | "income"
    | "expense";
  const amount = Number(formData.get("amount"));
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const transactionDate = String(formData.get("transaction_date") ?? "");

  if (!amount || amount <= 0) {
    return { error: "Nominal harus lebih dari 0." };
  }
  if (!transactionDate) {
    return { error: "Tanggal wajib diisi." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    category_id: categoryId,
    description,
    transaction_date: transactionDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");
  return { error: null };
}

export async function updateTransaction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "expense") as
    | "income"
    | "expense";
  const amount = Number(formData.get("amount"));
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const transactionDate = String(formData.get("transaction_date") ?? "");

  if (!id) return { error: "Transaksi tidak ditemukan." };
  if (!amount || amount <= 0) return { error: "Nominal harus lebih dari 0." };

  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      category_id: categoryId,
      description,
      transaction_date: transactionDate,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");
  return { error: null };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");
  return { error: null };
}

export async function upsertBudget(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const categoryId = String(formData.get("category_id") ?? "");
  const amount = Number(formData.get("amount"));
  const month = String(formData.get("month") ?? "");

  if (!categoryId || !month) return { error: "Data tidak lengkap." };
  if (amount < 0) return { error: "Nominal tidak valid." };

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_id: categoryId,
      amount,
      month,
    },
    { onConflict: "user_id,category_id,month" }
  );

  if (error) return { error: error.message };

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateCategoryBudget(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const categoryId = String(formData.get("category_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const month = String(formData.get("month") ?? "");

  if (!categoryId) return { error: "Kategori tidak ditemukan." };
  if (!name) return { error: "Nama kategori wajib diisi." };
  if (!month) return { error: "Bulan tidak valid." };
  if (Number.isNaN(amount) || amount < 0) return { error: "Nominal tidak valid." };

  const { error: categoryError } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (categoryError) return { error: categoryError.message };

  const { error: budgetError } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_id: categoryId,
      amount,
      month,
    },
    { onConflict: "user_id,category_id,month" }
  );

  if (budgetError) return { error: budgetError.message };

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { error: null };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { error: null };
}

const CATEGORY_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#6B7280",
  "#10B981",
  "#0EA5E9",
];

export async function saveBudgetEntry(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };

  const month = String(formData.get("month") ?? "");
  const amount = Number(formData.get("amount"));
  let categoryId = String(formData.get("category_id") ?? "");
  const newCategoryName = String(formData.get("new_category_name") ?? "").trim();

  if (!month) return { error: "Bulan tidak valid." };
  if (!amount || amount < 0) return { error: "Nominal tidak valid." };

  if (categoryId === "__new__") {
    if (!newCategoryName) {
      return { error: "Nama kategori baru wajib diisi." };
    }
    const color =
      CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
    const { data: newCategory, error: categoryError } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: newCategoryName,
        type: "expense",
        color,
        icon: "circle",
      })
      .select()
      .single();

    if (categoryError) return { error: categoryError.message };
    categoryId = newCategory.id;
  }

  if (!categoryId) return { error: "Pilih kategori terlebih dahulu." };

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_id: categoryId,
      amount,
      month,
    },
    { onConflict: "user_id,category_id,month" }
  );

  if (error) return { error: error.message };

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { error: null };
}
