"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/format";

interface TrendPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--primary-soft)" }}
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="income" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={10} />
          <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
