export type FilterKind = "date" | "select" | "class" | "section" | "exam" | "route" | "hostel";

export interface FilterDef {
  key: string;
  label: string;
  kind: FilterKind;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ReportTemplate {
  key: string;
  title: string;
  description: string;
  module: string;
  filters: FilterDef[];
}

export type ColumnType = "string" | "number" | "money" | "percent" | "date";

export interface ReportColumn {
  key: string;
  label: string;
  type: ColumnType;
}

export interface SummaryItem {
  label: string;
  value: string | number;
  type: ColumnType;
}

/** A row is an array aligned to `columns`. */
export type ReportRow = (string | number | null)[];

export interface ReportMeta {
  id: string;
  templateKey: string;
  templateTitle: string;
  filterSummary: string[];
  rowCount: number;
  truncated: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface GeneratedReport extends ReportMeta {
  columns: ReportColumn[];
  summary: SummaryItem[];
  rows: ReportRow[];
  ttlHours?: number;
}

export interface ReportPage extends ReportMeta {
  columns: ReportColumn[];
  summary: SummaryItem[];
  rows: ReportRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export type ExportFormat = "pdf" | "xlsx" | "csv";
export const EXPORT_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" },
];
