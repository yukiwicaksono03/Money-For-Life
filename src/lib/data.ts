import { createClient } from "@/lib/supabase/server";
import type { Budget, Category, Transaction } from "@/lib/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("type", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

interface TransactionFilters {
  month?: string; // "YYYY-MM-01"
  categoryId?: string;
  type?: "income" | "expense";
}

function monthRange(month: string) {
  const start = new Date(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month) {
    const { from, to } = monthRange(filters.month);
    query = query.gte("transaction_date", from).lt("transaction_date", to);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Transaction[]) ?? [];
}

export async function getMonthSummary(month: string) {
  const transactions = await getTransactions({ month });
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  return { income, expense, balance: income - expense, transactions };
}

export async function getLastMonthsTrend(monthsBack = 6) {
  const supabase = await createClient();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, transaction_date")
    .gte("transaction_date", start.toISOString().slice(0, 10));

  if (error) throw error;

  const buckets = new Map<string, { income: number; expense: number }>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { income: 0, expense: 0 });
  }

  for (const row of data ?? []) {
    const d = new Date(row.transaction_date as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (row.type === "income") bucket.income += Number(row.amount);
    else bucket.expense += Number(row.amount);
  }

  return Array.from(buckets.entries()).map(([key, value]) => {
    const [year, month] = key.split("-").map(Number);
    const label = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
      new Date(year, month - 1, 1)
    );
    return { key, label, ...value };
  });
}

export async function getBudgets(month: string): Promise<Budget[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*, category:categories(*)")
    .eq("month", month);

  if (error) throw error;
  return (data as unknown as Budget[]) ?? [];
}
