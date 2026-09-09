import { apiClient } from "@/lib/api-client";
import type { ExamMark, BulkMarkEntry, PaginatedResult } from "./examMark.types";

export const examMarkApi = {
  listBySchedule: (examScheduleId: string) =>
    apiClient.get<PaginatedResult<ExamMark>>(`/exam-marks?limit=200&examScheduleId=${examScheduleId}`),
  bulkCreate: (examScheduleId: string, marks: BulkMarkEntry[]) =>
    apiClient.post<{ created: ExamMark[]; failed: { studentId: string; reason: string }[] }>(
      "/exam-marks/bulk",
      { examScheduleId, marks }
    ),
  update: (id: string, obtainedMarks: number, reason?: string) =>
    apiClient.patch<ExamMark>(`/exam-marks/${id}`, { obtainedMarks, reason }),
};
