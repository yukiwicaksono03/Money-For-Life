"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Receipt, PiggyBank } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Beranda", icon: LayoutGrid },
  { href: "/transactions", label: "Transaksi", icon: Receipt },
  { href: "/budget", label: "Anggaran", icon: PiggyBank },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted"
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-primary" : "text-muted"}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
