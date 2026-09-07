import { apiClient } from "@/lib/api-client";
import type {
  TeacherAssignment,
  CreateAssignmentPayload,
  PaginatedResult,
  ListAssignmentsParams,
} from "./teacherAssignment.types";

const toQueryString = (params: ListAssignmentsParams) => {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.classId) search.set("classId", params.classId);
  if (params.sectionId) search.set("sectionId", params.sectionId);
  if (params.teacherId) search.set("teacherId", params.teacherId);
  if (params.academicYearId) search.set("academicYearId", params.academicYearId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const assignmentApi = {
  list: (params: ListAssignmentsParams = {}) =>
    apiClient.get<PaginatedResult<TeacherAssignment>>(`/teacher-assignments${toQueryString(params)}`),
  create: (payload: CreateAssignmentPayload) =>
    apiClient.post<TeacherAssignment>("/teacher-assignments", payload),
  delete: (id: string) => apiClient.delete<null>(`/teacher-assignments/${id}`),
};
