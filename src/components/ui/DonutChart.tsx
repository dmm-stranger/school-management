"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export type DonutSlice = { name: string; value: number; color: string };

/**
 * One reusable donut chart with a centered label and a legend list.
 * Used by the dashboard's Fee Collection chart and the student
 * profile's Attendance This Month chart — previously each component
 * built its own <PieChart> from scratch.
 */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
  size = 160,
  format = "number",
}: {
  data: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  size?: number;
  format?: "number" | "currency";
}) {
  const formatValue = (v: number) =>
    format === "currency" ? `$${v.toLocaleString()}` : String(v);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ height: size, width: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={size * 0.3}
              outerRadius={size * 0.425}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-display text-lg font-bold text-heading">
            {centerValue}
          </span>
          <span className="text-[10px] text-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="space-y-1.5 text-sm">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-muted">{entry.name}</span>
            <span className="font-medium text-heading">
              {formatValue(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
