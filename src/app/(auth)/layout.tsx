export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-white">
            M
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Money for Life
          </h1>
          <p className="mt-1 text-sm text-muted">
            Catat & rencanakan keuanganmu dengan tenang
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
