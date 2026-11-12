import { apiClient } from "@/lib/api-client";
import type { ReportTemplate, GeneratedReport, ReportPage, ReportMeta, ExportFormat } from "./report.types";

export const reportApi = {
  listTemplates: () => apiClient.get<ReportTemplate[]>("/reports/templates"),
  history: () => apiClient.get<ReportMeta[]>("/reports/history"),
  generate: (templateKey: string, filters: Record<string, string>) =>
    apiClient.post<GeneratedReport>("/reports/generate", { templateKey, filters }),
  getPage: (id: string, page: number, limit: number) => apiClient.get<ReportPage>(`/reports/generated/${id}?page=${page}&limit=${limit}`),
  exportFile: (id: string, format: ExportFormat) => apiClient.download(`/reports/generated/${id}/export?format=${format}`),
};
