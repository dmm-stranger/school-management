import type { ReportColumn, ReportRow } from "./report.types";
import { formatReportCell, isNumericColumn } from "./report.format";

interface ReportTableProps {
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Compact styling for the printout. */
  print?: boolean;
}

export function ReportTable({ columns, rows, print = false }: ReportTableProps) {
  const cell = print ? "px-2 py-1" : "px-4 py-2.5";
  return (
    <table className={`w-full ${print ? "text-[10px]" : "text-sm"}`}>
      <thead>
        <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
          {columns.map((c) => (
            <th key={c.key} scope="col" className={`${cell} ${isNumericColumn(c.type) ? "text-right" : ""}`}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--color-border)]">
        {rows.map((row, r) => (
          <tr key={r} className={print ? "" : "hover:bg-[var(--color-surface-alt)]"}>
            {row.map((value, i) => (
              <td key={columns[i].key} className={`${cell} ${isNumericColumn(columns[i].type) ? "text-right tabular-nums" : ""} text-heading`}>
                {formatReportCell(value, columns[i].type)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
