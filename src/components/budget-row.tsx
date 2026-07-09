"use client";

import { useActionState, useState } from "react";
import { Check, ChevronDown, Pencil } from "lucide-react";
import clsx from "clsx";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryEditSheet } from "@/components/category-edit-sheet";
import { TransactionRow } from "@/components/transaction-row";
import { formatCurrency } from "@/lib/format";
import { upsertBudget, type ActionResult } from "@/app/(app)/actions";
import type { Category, Transaction } from "@/lib/types/database";

const initialState: ActionResult = { error: null };

export function BudgetRow({
  category,
  amount,
  spent,
  transactions,
  month,
}: {
  category: Category;
  amount: number;
  spent: number;
  transactions: Transaction[];
  month: string;
}) {
  const [state, formAction, pending] = useActionState(
    upsertBudget,
    initialState
  );
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const hasBudget = amount > 0;
  const percent = hasBudget ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
  const remaining = amount - spent;
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
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          aria-label={`Edit kategori ${category.name}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
        >
          <Pencil size={15} />
        </button>
      </div>

      {hasBudget && (
        <>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${percent}%`,
                backgroundColor: overBudget ? "var(--danger)" : category.color,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">{percent}% terpakai</span>
            <span
              className={clsx(
                "font-medium",
                overBudget ? "text-danger" : "text-primary"
              )}
            >
              {overBudget
                ? `Lebih ${formatCurrency(Math.abs(remaining))}`
                : `Sisa ${formatCurrency(remaining)}`}
            </span>
          </div>
        </>
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

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        disabled={transactions.length === 0}
        className="mt-3 flex w-full items-center justify-between text-xs font-medium text-muted disabled:opacity-50"
      >
        <span>
          {transactions.length === 0
            ? "Belum ada transaksi"
            : `${transactions.length} transaksi bulan ini`}
        </span>
        {transactions.length > 0 && (
          <ChevronDown
            size={15}
            className={clsx(
              "transition-transform",
              detailsOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {detailsOpen && transactions.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
          {transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} readOnly hideCategory />
          ))}
        </div>
      )}

      {editOpen && (
        <CategoryEditSheet
          category={category}
          amount={amount}
          month={month}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
