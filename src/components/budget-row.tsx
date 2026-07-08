"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { formatCurrency } from "@/lib/format";
import { upsertBudget, type ActionResult } from "@/app/(app)/actions";
import type { Category } from "@/lib/types/database";

const initialState: ActionResult = { error: null };

export function BudgetRow({
  category,
  amount,
  spent,
  month,
}: {
  category: Category;
  amount: number;
  spent: number;
  month: string;
}) {
  const [state, formAction, pending] = useActionState(
    upsertBudget,
    initialState
  );

  const hasBudget = amount > 0;
  const percent = hasBudget ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
  const overBudget = hasBudget && spent > amount;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} size={16} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {category.name}
          </p>
          <p className="text-xs text-muted">
            {formatCurrency(spent)}
            {hasBudget && ` dari ${formatCurrency(amount)}`}
          </p>
        </div>
      </div>

      {hasBudget && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percent}%`,
              backgroundColor: overBudget ? "var(--danger)" : category.color,
            }}
          />
        </div>
      )}

      <form action={formAction} className="mt-3 flex items-center gap-2">
        <input type="hidden" name="category_id" value={category.id} />
        <input type="hidden" name="month" value={month} />
        <input
          name="amount"
          type="number"
          min={0}
          step={1}
          defaultValue={amount || ""}
          placeholder="Set anggaran"
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Simpan anggaran"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary disabled:opacity-50"
        >
          <Check size={15} />
        </button>
      </form>
      {state.error && (
        <p className="mt-1.5 text-xs text-danger">{state.error}</p>
      )}
    </div>
  );
}
