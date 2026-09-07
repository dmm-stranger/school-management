import { apiClient } from "@/lib/api-client";
import type {
  Subject,
  CreateSubjectPayload,
  PaginatedResult,
  ListSubjectsParams,
} from "./subject.types";

const toQueryString = (params: ListSubjectsParams) => {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.classId) search.set("classId", params.classId);
  if (params.group) search.set("group", params.group);
  if (params.status) search.set("status", params.status);
  if (params.search) search.set("search", params.search);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const subjectApi = {
  list: (params: ListSubjectsParams = {}) =>
    apiClient.get<PaginatedResult<Subject>>(`/subjects${toQueryString(params)}`),
  create: (payload: CreateSubjectPayload) => apiClient.post<Subject>("/subjects", payload),
  update: (id: string, payload: Partial<CreateSubjectPayload>) =>
    apiClient.patch<Subject>(`/subjects/${id}`, payload),
  delete: (id: string) => apiClient.delete<null>(`/subjects/${id}`),
};
