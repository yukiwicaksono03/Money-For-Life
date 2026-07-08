import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Keluar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
