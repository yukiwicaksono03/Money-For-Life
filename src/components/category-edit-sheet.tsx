"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { X, Trash2 } from "lucide-react";
import {
  updateCategoryBudget,
  deleteCategory,
  type ActionResult,
} from "@/app/(app)/actions";
import type { Category } from "@/lib/types/database";

const initialState: ActionResult = { error: null };

export function CategoryEditSheet({
  category,
  amount,
  month,
  onClose,
}: {
  category: Category;
  amount: number;
  month: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateCategoryBudget,
    initialState
  );
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!pending && state.error === null && state !== initialState) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  function handleDelete() {
    const confirmed = confirm(
      `Hapus kategori "${category.name}"? Transaksi yang memakai kategori ini akan jadi "Tanpa kategori", dan anggaran untuk kategori ini akan ikut terhapus.`
    );
    if (!confirmed) return;

    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Edit Kategori
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
          <input type="hidden" name="category_id" value={category.id} />
          <input type="hidden" name="month" value={month} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nama Kategori
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={category.name}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

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
              defaultValue={amount || ""}
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
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger transition-opacity disabled:opacity-60"
        >
          <Trash2 size={15} />
          {isDeleting ? "Menghapus..." : "Hapus Kategori"}
        </button>
        {deleteError && (
          <p className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {deleteError}
          </p>
        )}
      </div>
    </div>
  );
}
