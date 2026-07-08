"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { monthLabel } from "@/lib/format";

export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(offset: number) {
    const d = new Date(month);
    d.setMonth(d.getMonth() + offset);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Bulan sebelumnya"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-medium capitalize text-foreground">
        {monthLabel(month)}
      </span>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Bulan berikutnya"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
