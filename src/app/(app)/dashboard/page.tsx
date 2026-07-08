import Link from "next/link";
import { getCategories, getLastMonthsTrend, getMonthSummary } from "@/lib/data";
import { currentMonthValue } from "@/lib/format";
import { Header } from "@/components/header";
import { SummaryCard } from "@/components/summary-card";
import { TrendChart } from "@/components/trend-chart";
import { TransactionRow } from "@/components/transaction-row";
import { QuickAddFab } from "@/components/quick-add-fab";

export default async function DashboardPage() {
  const month = currentMonthValue();
  const [summary, trend, categories] = await Promise.all([
    getMonthSummary(month),
    getLastMonthsTrend(6),
    getCategories(),
  ]);

  const recent = summary.transactions.slice(0, 5);

  return (
    <>
      <Header title="Money for Life" subtitle="Ringkasan keuanganmu" />

      <div className="flex flex-col gap-6 px-5 pt-5">
        <SummaryCard
          income={summary.income}
          expense={summary.expense}
          balance={summary.balance}
        />

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-foreground">
            Tren 6 Bulan Terakhir
          </p>
          <TrendChart data={trend} />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Pemasukan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" /> Pengeluaran
            </span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Transaksi Terbaru
            </p>
            <Link href="/transactions" className="text-xs font-medium text-primary">
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
                Belum ada transaksi bulan ini. Yuk mulai catat!
              </div>
            ) : (
              recent.map((t) => (
                <TransactionRow key={t.id} transaction={t} readOnly />
              ))
            )}
          </div>
        </div>
      </div>

      <QuickAddFab categories={categories} />
    </>
  );
}
