import { apiClient } from "@/lib/api-client";
import type { Exam, CreateExamPayload, PaginatedResult } from "./exam.types";

export const examApi = {
  list: () => apiClient.get<PaginatedResult<Exam>>("/exams?limit=100"),
  create: (payload: CreateExamPayload) => apiClient.post<Exam>("/exams", payload),
  update: (id: string, payload: Partial<CreateExamPayload> & { status?: string }) =>
    apiClient.patch<Exam>(`/exams/${id}`, payload),
  delete: (id: string) => apiClient.delete<null>(`/exams/${id}`),
};
