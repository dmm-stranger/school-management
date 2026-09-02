import { apiClient } from "@/lib/api-client";
import type { Student, PaginatedResult, ListStudentsParams } from "./student.types";

const toQueryString = (params: ListStudentsParams) => {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search) search.set("search", params.search);
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const studentApi = {
  list: (params: ListStudentsParams = {}) =>
    apiClient.get<PaginatedResult<Student>>(`/students${toQueryString(params)}`),

  get: (id: string) => apiClient.get<Student>(`/students/${id}`),

  delete: (id: string) => apiClient.delete<null>(`/students/${id}`),
};
