"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionSheet } from "@/components/transaction-sheet";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type ActionResult,
} from "@/app/(app)/actions";
import type { Category, Transaction } from "@/lib/types/database";

type OptimisticAction =
  | { type: "add" | "update"; transaction: Transaction }
  | { type: "remove"; id: string };

function sortByDateDesc(a: Transaction, b: Transaction) {
  if (a.transaction_date !== b.transaction_date) {
    return a.transaction_date < b.transaction_date ? 1 : -1;
  }
  return a.created_at < b.created_at ? 1 : -1;
}

export function TransactionsClient({
  transactions,
  categories,
}: {
  transactions: Transaction[];
  categories: Category[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticTransactions, applyOptimistic] = useOptimistic(
    transactions,
    (state, action: OptimisticAction) => {
      if (action.type === "remove") {
        return state.filter((t) => t.id !== action.id);
      }
      if (action.type === "add") {
        return [...state, action.transaction].sort(sortByDateDesc);
      }
      return state
        .map((t) => (t.id === action.transaction.id ? action.transaction : t))
        .sort(sortByDateDesc);
    }
  );

  function openAdd() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setSheetOpen(true);
  }

  function close() {
    setSheetOpen(false);
    setEditing(null);
  }

  function handleSubmit(
    draft: Transaction,
    formData: FormData,
    isEditing: boolean
  ) {
    close();
    setMutationError(null);
    startTransition(async () => {
      applyOptimistic({ type: isEditing ? "update" : "add", transaction: draft });
      const action = isEditing ? updateTransaction : addTransaction;
      const result: ActionResult = await action({ error: null }, formData);
      if (result.error) setMutationError(result.error);
    });
  }

  function handleDelete(id: string) {
    setMutationError(null);
    startTransition(async () => {
      applyOptimistic({ type: "remove", id });
      const result = await deleteTransaction(id);
      if (result.error) setMutationError(result.error);
    });
  }

  return (
    <>
      {mutationError && (
        <div className="mx-5 mb-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {mutationError}
        </div>
      )}
      <div className="flex flex-col gap-2 px-5 pb-24">
        {optimisticTransactions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Belum ada transaksi di bulan ini.
          </div>
        ) : (
          optimisticTransactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={openAdd}
        aria-label="Tambah transaksi"
        className="fixed right-4 z-[25] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 sm:right-[max(1rem,calc(50%-16rem+1rem))]"
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        <Plus size={24} />
      </button>

      {sheetOpen && (
        <TransactionSheet
          categories={categories}
          editing={editing}
          onClose={close}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
