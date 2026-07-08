"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TransactionSheet } from "@/components/transaction-sheet";
import type { Category } from "@/lib/types/database";

export function QuickAddFab({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tambah transaksi"
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 sm:right-[max(1rem,calc(50%-16rem+1rem))]"
      >
        <Plus size={24} />
      </button>
      {open && (
        <TransactionSheet
          categories={categories}
          editing={null}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
