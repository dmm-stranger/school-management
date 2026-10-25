import { apiClient } from "@/lib/api-client";
import type { PaginatedResult, Staff, ListStaffParams } from "./staff.types";

const toQuery = (params: ListStaffParams): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const staffApi = {
  list: (params: ListStaffParams = {}) => apiClient.get<PaginatedResult<Staff>>(`/staff${toQuery(params)}`),
};
