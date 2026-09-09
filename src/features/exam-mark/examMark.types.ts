export interface ExamMark {
  _id: string;
  examScheduleId: { _id: string; examDate: string; fullMarks: number; passMarks: number } | string;
  studentId: { _id: string; studentId: string; personalInfo: { fullName: string } } | string;
  obtainedMarks: number;
  remarks?: string;
}

export interface BulkMarkEntry {
  studentId: string;
  obtainedMarks: number;
  remarks?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
