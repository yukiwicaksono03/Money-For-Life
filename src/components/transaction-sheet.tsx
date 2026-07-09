"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { addTransaction, updateTransaction, type ActionResult } from "@/app/(app)/actions";
import { ReceiptScanButton, type ScanResultData } from "@/components/receipt-scan-button";
import type { Category, Transaction } from "@/lib/types/database";

const initialState: ActionResult = { error: null };

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionSheet({
  categories,
  editing,
  onClose,
}: {
  categories: Category[];
  editing: Transaction | null;
  onClose: () => void;
}) {
  const isEditing = Boolean(editing);
  const action = isEditing ? updateTransaction : addTransaction;
  const [state, formAction, pending] = useActionState(action, initialState);
  // `editing` is stable for the lifetime of this instance: the parent
  // unmounts/remounts the sheet each time it is opened for a new target.
  const [type, setType] = useState<"income" | "expense">(
    editing?.type ?? "expense"
  );
  const [amount, setAmount] = useState(
    editing?.amount ? String(editing.amount) : ""
  );
  const [description, setDescription] = useState(editing?.description ?? "");
  const [transactionDate, setTransactionDate] = useState(
    editing?.transaction_date ?? todayValue()
  );
  const [categoryId, setCategoryId] = useState(editing?.category_id ?? "");
  const [scanNotice, setScanNotice] = useState(false);

  useEffect(() => {
    if (!pending && state.error === null && state !== initialState) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  function handleScanned(data: ScanResultData) {
    if (data.amount) setAmount(String(data.amount));
    if (data.description) setDescription(data.description);
    if (data.transactionDate) setTransactionDate(data.transactionDate);
    if (data.categoryId) setCategoryId(data.categoryId);
    setScanNotice(true);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
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
          {isEditing && <input type="hidden" name="id" value={editing!.id} />}

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-background p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={clsx(
                  "rounded-lg py-2 text-sm font-medium transition-colors",
                  type === t
                    ? t === "income"
                      ? "bg-primary text-white"
                      : "bg-danger text-white"
                    : "text-muted"
                )}
              >
                {t === "income" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />

          {type === "expense" && !isEditing && (
            <>
              <ReceiptScanButton onScanned={handleScanned} />
              {scanNotice && (
                <p className="-mt-2 text-xs text-primary">
                  Data terisi dari struk. Periksa dulu sebelum disimpan ya.
                </p>
              )}
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-medium text-foreground">
              Nominal (Rp)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={1}
              step={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category_id" className="text-sm font-medium text-foreground">
              Kategori
            </label>
            <select
              id="category_id"
              name="category_id"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Tanpa kategori</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="transaction_date" className="text-sm font-medium text-foreground">
              Tanggal
            </label>
            <input
              id="transaction_date"
              name="transaction_date"
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Catatan (opsional)
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mis. Makan siang tim"
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
            {pending ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
