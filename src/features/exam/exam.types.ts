export const EXAM_TYPES = [
  "Class Test",
  "Monthly Test",
  "Model Test",
  "Half Yearly",
  "Annual",
  "Pre-Test",
  "Test Examination",
  "SSC",
  "Custom",
] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export type ExamStatus = "DRAFT" | "SCHEDULED" | "ONGOING" | "COMPLETED" | "PUBLISHED" | "ARCHIVED";

export interface Exam {
  _id: string;
  academicYearId: { _id: string; year: string } | string;
  examName: string;
  examType: ExamType;
  startDate: string;
  endDate: string;
  status: ExamStatus;
}

export interface CreateExamPayload {
  academicYearId: string;
  examName: string;
  examType: ExamType;
  startDate: string;
  endDate: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
