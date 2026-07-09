import { BottomNav } from "@/components/bottom-nav";

// Auth is already enforced in `src/middleware.ts` for every route under this
// group, so we intentionally don't re-check the session here. Re-verifying
// on every layout render would add an extra Supabase round-trip to every
// single page navigation (dashboard/transactions/budget), which is the main
// thing making in-app navigation feel slow.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-4">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
