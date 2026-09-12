import { apiClient } from "@/lib/api-client";
import type { AttendanceRecord, BulkAttendancePayload, PaginatedResult } from "./studentAttendance.types";

export const studentAttendanceApi = {
  listByClassAndDate: (classId: string, sectionId: string, date: string) =>
    apiClient.get<PaginatedResult<AttendanceRecord>>(
      `/student-attendances?classId=${classId}&sectionId=${sectionId}&date=${date}&limit=200`
    ),
  bulkMark: (payload: BulkAttendancePayload) =>
    apiClient.post<{ created: AttendanceRecord[]; failed: { studentId: string; reason: string }[] }>(
      "/student-attendances/bulk",
      payload
    ),
};
