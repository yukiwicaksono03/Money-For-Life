"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionSheet } from "@/components/transaction-sheet";
import type { Category, Transaction } from "@/lib/types/database";

export function TransactionsClient({
  transactions,
  categories,
}: {
  transactions: Transaction[];
  categories: Category[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

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

  return (
    <>
      <div className="flex flex-col gap-2 px-5">
        {transactions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Belum ada transaksi di bulan ini.
          </div>
        ) : (
          transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} onEdit={openEdit} />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={openAdd}
        aria-label="Tambah transaksi"
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 sm:right-[max(1rem,calc(50%-16rem+1rem))]"
      >
        <Plus size={24} />
      </button>

      {sheetOpen && (
        <TransactionSheet
          categories={categories}
          editing={editing}
          onClose={close}
        />
      )}
    </>
  );
}
