import { apiClient } from "@/lib/api-client";
import type { TeacherOption, PaginatedResult } from "./teacher.types";

export const teacherApi = {
  /** Lightweight list for dropdowns — full CRUD/detail pages are a later phase. */
  list: () => apiClient.get<PaginatedResult<TeacherOption>>("/teachers?limit=100&status=ACTIVE"),
};
