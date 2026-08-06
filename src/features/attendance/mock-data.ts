import type { ClassAttendanceRow } from "@/types/attendance";

/**
 * TEMPORARY mock data. Replace with a real call through src/lib/api/client.ts
 * once GET /student-attendances (or /attendance-summary, per api-endpoints.md §9)
 * is wired up. Shape mirrors what that endpoint is expected to return, so the
 * swap should only touch this file and attendance/api.ts (not yet created).
 */
export const MOCK_TODAY_ATTENDANCE: ClassAttendanceRow[] = [
  { classLevel: 1, className: "Class 1", section: "A", totalStudents: 38, present: 36, absent: 1, leave: 1 },
  { classLevel: 2, className: "Class 2", section: "A", totalStudents: 40, present: 37, absent: 2, leave: 1 },
  { classLevel: 3, className: "Class 3", section: "A", totalStudents: 42, present: 39, absent: 3, leave: 0 },
  { classLevel: 4, className: "Class 4", section: "A", totalStudents: 41, present: 40, absent: 1, leave: 0 },
  { classLevel: 5, className: "Class 5", section: "A", totalStudents: 39, present: 35, absent: 3, leave: 1 },
  { classLevel: 6, className: "Class 6", section: "A", totalStudents: 44, present: 41, absent: 2, leave: 1 },
  { classLevel: 7, className: "Class 7", section: "A", totalStudents: 43, present: 40, absent: 3, leave: 0 },
  { classLevel: 8, className: "Class 8", section: "A", totalStudents: 45, present: 42, absent: 2, leave: 1 },
  { classLevel: 9, className: "Class 9", section: "A", totalStudents: 40, present: 36, absent: 4, leave: 0 },
  { classLevel: 10, className: "Class 10", section: "A", totalStudents: 37, present: 34, absent: 2, leave: 1 },
];
