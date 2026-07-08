"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BudgetSheet } from "@/components/budget-sheet";
import type { Category } from "@/lib/types/database";

export function BudgetAddFab({
  categories,
  month,
}: {
  categories: Category[];
  month: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tambah anggaran"
        className="fixed right-4 z-[25] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 sm:right-[max(1rem,calc(50%-16rem+1rem))]"
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        <Plus size={24} />
      </button>
      {open && (
        <BudgetSheet
          categories={categories}
          month={month}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
