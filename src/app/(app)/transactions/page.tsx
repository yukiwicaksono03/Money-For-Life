import { getCategories, getTransactions } from "@/lib/data";
import { currentMonthValue } from "@/lib/format";
import { Header } from "@/components/header";
import { MonthSwitcher } from "@/components/month-switcher";
import { TransactionsClient } from "@/components/transactions-client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentMonthValue();

  const [transactions, categories] = await Promise.all([
    getTransactions({ month }),
    getCategories(),
  ]);

  return (
    <>
      <Header title="Transaksi" subtitle="Semua catatan keuanganmu" />
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <MonthSwitcher month={month} />
      </div>
      <TransactionsClient transactions={transactions} categories={categories} />
    </>
  );
}
