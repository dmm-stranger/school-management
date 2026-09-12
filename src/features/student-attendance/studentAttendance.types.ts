export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE", "HOLIDAY", "HALF_DAY"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceRecord {
  _id: string;
  studentId: { _id: string; studentId: string; personalInfo: { fullName: string } } | string;
  date: string;
  attendanceStatus: AttendanceStatus;
  remarks?: string;
  status: "DRAFT" | "SUBMITTED" | "VERIFIED" | "LOCKED";
}

export interface BulkAttendanceEntry {
  studentId: string;
  attendanceStatus: AttendanceStatus;
  remarks?: string;
}

export interface BulkAttendancePayload {
  academicYearId: string;
  classId: string;
  sectionId: string;
  groupId?: string;
  date: string;
  entries: BulkAttendanceEntry[];
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
