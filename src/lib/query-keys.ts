/**
 * Centralized query keys — one place to see every cache key used in the
 * app, and to keep invalidation calls consistent (e.g. invalidating
 * queryKeys.students.all() after a student mutation, from any page).
 */
export const queryKeys = {
  academicYears: { all: () => ["academic-years"] as const },
  classes: { all: () => ["classes"] as const },
  sections: { all: (classId?: string) => ["sections", classId] as const },
  groups: { all: () => ["groups"] as const },
  subjects: { all: (params?: unknown) => ["subjects", params] as const },
  rooms: {
    all: (params?: unknown) => ["rooms", params] as const,
    detail: (id: string) => ["rooms", "detail", id] as const,
  },
  students: {
    all: (params?: unknown) => ["students", params] as const,
    detail: (id: string) => ["students", "detail", id] as const,
  },
  teachers: { all: () => ["teachers"] as const },
  teacherAssignments: { all: (params?: unknown) => ["teacher-assignments", params] as const },
  studentEnrollments: { all: (params?: unknown) => ["student-enrollments", params] as const },
  routine: {
    periods: () => ["routine", "periods"] as const,
    byClass: (classId: string) => ["routine", "class", classId] as const,
    conflicts: (scope: unknown) => ["routine", "conflicts", scope] as const,
  },
  exams: { all: () => ["exams"] as const },
  examSchedules: { all: (examId?: string) => ["exam-schedules", examId] as const },
  examMarks: { bySchedule: (scheduleId: string) => ["exam-marks", scheduleId] as const },
  examResults: { byStudent: (studentId: string) => ["exam-results", "student", studentId] as const },
  studentAttendance: {
    byClassAndDate: (classId: string, sectionId: string, date: string) =>
      ["student-attendance", classId, sectionId, date] as const,
  },
  attendanceSummary: {
    yearly: (studentId: string, year: number) => ["attendance-summary", "yearly", studentId, year] as const,
  },
  feeStructures: { all: () => ["fee-structures"] as const },
  studentFees: { all: () => ["student-fees"] as const },
  expenses: { all: () => ["expenses"] as const },
};
