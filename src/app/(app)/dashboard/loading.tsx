import { Header } from "@/components/header";
import { Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <Header title="Money for Life" subtitle="Ringkasan keuanganmu" />
      <div className="flex flex-col gap-6 px-5 pt-5">
        <Skeleton className="h-40 w-full rounded-3xl" />

        <div className="rounded-2xl border border-border bg-surface p-4">
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="h-44 w-full" />
        </div>

        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
