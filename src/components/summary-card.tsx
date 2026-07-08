import { formatCurrency } from "@/lib/format";

export function SummaryCard({
  income,
  expense,
  balance,
}: {
  income: number;
  expense: number;
  balance: number;
}) {
  return (
    <div className="rounded-3xl bg-primary p-6 text-white shadow-sm">
      <p className="text-xs font-medium text-white/70">Saldo Bulan Ini</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        {formatCurrency(balance)}
      </p>
      <div className="mt-5 flex items-center gap-6">
        <div>
          <p className="text-xs text-white/70">Pemasukan</p>
          <p className="text-sm font-semibold">{formatCurrency(income)}</p>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div>
          <p className="text-xs text-white/70">Pengeluaran</p>
          <p className="text-sm font-semibold">{formatCurrency(expense)}</p>
        </div>
      </div>
    </div>
  );
}
