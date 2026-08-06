"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ATTENDANCE_TREND } from "@/config/demo-data";

export function AttendanceTrendChart() {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-heading">
          Attendance Overview
        </h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ATTENDANCE_TREND} margin={{ left: -20 }}>
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                borderColor: "#E2E8F0",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="present"
              name="Present"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="absent"
              name="Absent"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
