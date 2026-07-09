"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteTransaction } from "@/app/(app)/actions";
import type { Transaction } from "@/lib/types/database";

export function TransactionRow({
  transaction,
  onEdit,
  readOnly = false,
  hideCategory = false,
}: {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  readOnly?: boolean;
  hideCategory?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const category = transaction.category;

  async function handleDelete() {
    if (!confirm("Hapus transaksi ini?")) return;
    setPending(true);
    await deleteTransaction(transaction.id);
    setPending(false);
  }

  const content = (
    <>
      <CategoryIcon
        icon={category?.icon ?? "circle"}
        color={category?.color ?? "#6B7280"}
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {hideCategory
            ? transaction.description || "Tanpa catatan"
            : category?.name ?? "Tanpa kategori"}
        </p>
        <p className="truncate text-xs text-muted">
          {hideCategory
            ? formatDate(transaction.transaction_date)
            : transaction.description || formatDate(transaction.transaction_date)}
        </p>
      </div>
      <span
        className={`shrink-0 text-sm font-semibold ${
          transaction.type === "income" ? "text-primary" : "text-danger"
        }`}
      >
        {transaction.type === "income" ? "+" : "-"}
        {formatCurrency(Number(transaction.amount))}
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      {readOnly || !onEdit ? (
        <div className="flex flex-1 items-center gap-3">{content}</div>
      ) : (
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {content}
        </button>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          aria-label="Hapus"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-danger disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
