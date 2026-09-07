export type AcademicYearStatus = "ACTIVE" | "INACTIVE" | "COMPLETED" | "ARCHIVED";

export interface AcademicYear {
  _id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  createdAt: string;
}

export interface CreateAcademicYearPayload {
  year: string;
  startDate: string;
  endDate: string;
  status?: AcademicYearStatus;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
