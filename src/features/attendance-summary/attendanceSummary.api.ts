import { apiClient } from "@/lib/api-client";
import type { MonthlySummary, YearlySummary } from "./attendanceSummary.types";

export const attendanceSummaryApi = {
  monthly: (studentId: string, month: number, year: number) =>
    apiClient.get<MonthlySummary>(`/attendance-summary/student/${studentId}/monthly?month=${month}&year=${year}`),
  yearly: (studentId: string, year: number) =>
    apiClient.get<YearlySummary>(`/attendance-summary/student/${studentId}/yearly?year=${year}`),
};
