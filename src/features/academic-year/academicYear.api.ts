import { apiClient } from "@/lib/api-client";
import type {
  AcademicYear,
  CreateAcademicYearPayload,
  PaginatedResult,
} from "./academicYear.types";

export const academicYearApi = {
  list: () => apiClient.get<PaginatedResult<AcademicYear>>("/academic-years?limit=100"),
  create: (payload: CreateAcademicYearPayload) =>
    apiClient.post<AcademicYear>("/academic-years", payload),
  update: (id: string, payload: Partial<CreateAcademicYearPayload>) =>
    apiClient.patch<AcademicYear>(`/academic-years/${id}`, payload),
  delete: (id: string) => apiClient.delete<null>(`/academic-years/${id}`),
};
