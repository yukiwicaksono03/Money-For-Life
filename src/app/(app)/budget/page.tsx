import { getBudgets, getCategories, getMonthSummary } from "@/lib/data";
import { currentMonthValue, formatCurrency } from "@/lib/format";
import { Header } from "@/components/header";
import { MonthSwitcher } from "@/components/month-switcher";
import { BudgetRow } from "@/components/budget-row";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentMonthValue();

  const [categories, budgets, summary] = await Promise.all([
    getCategories(),
    getBudgets(month),
    getMonthSummary(month),
  ]);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const spentByCategory = new Map<string, number>();
  for (const t of summary.transactions) {
    if (t.type !== "expense" || !t.category_id) continue;
    spentByCategory.set(
      t.category_id,
      (spentByCategory.get(t.category_id) ?? 0) + Number(t.amount)
    );
  }

  const budgetByCategory = new Map(budgets.map((b) => [b.category_id, Number(b.amount)]));
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <>
      <Header title="Anggaran" subtitle="Rencanakan pengeluaran bulananmu" />
      <div className="flex flex-col gap-4 px-5 pt-5 pb-6">
        <MonthSwitcher month={month} />

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total anggaran</span>
            <span className="font-medium text-foreground">
              {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-sm">
            <span className="text-muted">Total terpakai</span>
            <span
              className={`font-medium ${
                summary.expense > totalBudget && totalBudget > 0
                  ? "text-danger"
                  : "text-foreground"
              }`}
            >
              {formatCurrency(summary.expense)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {expenseCategories.map((c) => (
            <BudgetRow
              key={c.id}
              category={c}
              amount={budgetByCategory.get(c.id) ?? 0}
              spent={spentByCategory.get(c.id) ?? 0}
              month={month}
            />
          ))}
        </div>
      </div>
    </>
  );
}
