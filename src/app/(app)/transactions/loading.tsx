import { Header } from "@/components/header";
import { Skeleton } from "@/components/skeleton";

export default function TransactionsLoading() {
  return (
    <>
      <Header title="Transaksi" subtitle="Semua catatan keuanganmu" />
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="flex flex-col gap-2 px-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </>
  );
}
