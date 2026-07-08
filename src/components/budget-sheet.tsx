"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";
import { saveBudgetEntry, type ActionResult } from "@/app/(app)/actions";
import type { Category } from "@/lib/types/database";

const initialState: ActionResult = { error: null };
const NEW_CATEGORY_VALUE = "__new__";

export function BudgetSheet({
  categories,
  month,
  onClose,
}: {
  categories: Category[];
  month: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveBudgetEntry,
    initialState
  );
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ?? NEW_CATEGORY_VALUE
  );
  const isNewCategory = categoryId === NEW_CATEGORY_VALUE;

  useEffect(() => {
    if (!pending && state.error === null && state !== initialState) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Tambah Anggaran
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="month" value={month} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category_id" className="text-sm font-medium text-foreground">
              Kategori
            </label>
            <select
              id="category_id"
              name="category_id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Buat kategori baru...</option>
            </select>
          </div>

          {isNewCategory && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new_category_name"
                className="text-sm font-medium text-foreground"
              >
                Nama Kategori Baru
              </label>
              <input
                id="new_category_name"
                name="new_category_name"
                type="text"
                required
                placeholder="Mis. Pendidikan"
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-medium text-foreground">
              Nominal Anggaran (Rp)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step={1}
              required
              placeholder="0"
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan Anggaran"}
          </button>
        </form>
      </div>
    </div>
  );
}
