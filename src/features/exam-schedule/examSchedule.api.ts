import { apiClient } from "@/lib/api-client";
import type { ExamSchedule, CreateSchedulePayload, PaginatedResult } from "./examSchedule.types";

export const examScheduleApi = {
  list: (examId?: string) =>
    apiClient.get<PaginatedResult<ExamSchedule>>(`/exam-schedules?limit=100${examId ? `&examId=${examId}` : ""}`),
  get: (id: string) => apiClient.get<ExamSchedule>(`/exam-schedules/${id}`),
  create: (payload: CreateSchedulePayload) => apiClient.post<ExamSchedule>("/exam-schedules", payload),
  update: (id: string, payload: Partial<CreateSchedulePayload> & { status?: string }) =>
    apiClient.patch<ExamSchedule>(`/exam-schedules/${id}`, payload),
  delete: (id: string) => apiClient.delete<null>(`/exam-schedules/${id}`),
  addInvigilator: (id: string, teacherId: string, role?: "MAIN" | "ASSISTANT") =>
    apiClient.post(`/exam-schedules/${id}/invigilators`, { teacherId, role }),
  removeInvigilator: (id: string, invigilatorId: string) =>
    apiClient.delete<null>(`/exam-schedules/${id}/invigilators/${invigilatorId}`),
};
