import { Header } from "@/components/header";
import { Skeleton } from "@/components/skeleton";

export default function BudgetLoading() {
  return (
    <>
      <Header title="Anggaran" subtitle="Rencanakan pengeluaran bulananmu" />
      <div className="flex flex-col gap-4 px-5 pt-5 pb-28">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </>
  );
}
