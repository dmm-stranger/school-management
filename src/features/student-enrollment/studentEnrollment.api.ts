import { apiClient } from "@/lib/api-client";
import type {
  StudentEnrollment,
  CreateEnrollmentPayload,
  PromotePayload,
  TransferPayload,
  PaginatedResult,
  ListEnrollmentsParams,
} from "./studentEnrollment.types";

const toQueryString = (params: ListEnrollmentsParams) => {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.classId) search.set("classId", params.classId);
  if (params.sectionId) search.set("sectionId", params.sectionId);
  if (params.academicYearId) search.set("academicYearId", params.academicYearId);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const enrollmentApi = {
  list: (params: ListEnrollmentsParams = {}) =>
    apiClient.get<PaginatedResult<StudentEnrollment>>(`/student-enrollments${toQueryString(params)}`),
  create: (payload: CreateEnrollmentPayload) =>
    apiClient.post<StudentEnrollment>("/student-enrollments", payload),
  promote: (payload: PromotePayload) =>
    apiClient.post<StudentEnrollment>("/student-enrollments/promote", payload),
  transfer: (payload: TransferPayload) =>
    apiClient.post<StudentEnrollment>("/student-enrollments/transfer", payload),
  delete: (id: string) => apiClient.delete<null>(`/student-enrollments/${id}`),
};
