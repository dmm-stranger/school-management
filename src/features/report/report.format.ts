import type { ColumnType, ReportRow, SummaryItem } from "./report.types";

/**
 * Report dates are plain calendar days ("2026-03-01"), not moments in time. Parsing one with
 * `new Date()` gives UTC midnight, and formatting that in the browser's LOCAL timezone shows the
 * PREVIOUS day for anyone west of UTC. So format explicitly in UTC.
 */
export const formatReportDate = (day: string): string => {
  const d = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};

export const formatReportCell = (value: ReportRow[number] | SummaryItem["value"], type: ColumnType): string => {
  if (value === null || value === undefined || value === "") return "";
  if (type === "money") return `৳${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (type === "percent") return `${Number(value).toFixed(1)}%`;
  if (type === "date") return formatReportDate(String(value));
  if (type === "number") return Number(value).toLocaleString("en-US");
  return String(value);
};

export const isNumericColumn = (type: ColumnType) => type === "number" || type === "money" || type === "percent";
