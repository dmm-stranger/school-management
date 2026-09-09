import { apiClient } from "@/lib/api-client";
import type { ExamResult, GenerateResultsPayload } from "./examResult.types";

export const examResultApi = {
  generate: (payload: GenerateResultsPayload) =>
    apiClient.post<{ generated: number; skipped: { studentId: string; reason: string }[] }>(
      "/exam-results/generate",
      payload
    ),
  publish: (examId: string) => apiClient.post<{ published: number }>("/exam-results/publish", { examId }),
  listByStudent: (studentId: string) => apiClient.get<ExamResult[]>(`/exam-results/student/${studentId}`),
};
