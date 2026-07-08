import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-4">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
