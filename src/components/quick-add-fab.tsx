"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { TransactionSheet } from "@/components/transaction-sheet";
import { addTransaction, updateTransaction, type ActionResult } from "@/app/(app)/actions";
import type { Category, Transaction } from "@/lib/types/database";

export function QuickAddFab({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(
    _draft: Transaction,
    formData: FormData,
    isEditing: boolean
  ) {
    setOpen(false);
    setError(null);
    startTransition(async () => {
      const action = isEditing ? updateTransaction : addTransaction;
      const result: ActionResult = await action({ error: null }, formData);
      if (result.error) setError(result.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tambah transaksi"
        className="fixed right-4 z-[25] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 sm:right-[max(1rem,calc(50%-16rem+1rem))]"
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        <Plus size={24} />
      </button>
      {error && (
        <div className="fixed bottom-40 left-1/2 z-[25] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 rounded-xl bg-danger-soft px-4 py-2.5 text-center text-sm text-danger shadow-lg">
          {error}
        </div>
      )}
      {open && (
        <TransactionSheet
          categories={categories}
          editing={null}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
