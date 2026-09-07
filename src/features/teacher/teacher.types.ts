export interface TeacherOption {
  _id: string;
  employeeId: string;
  personalInfo: { fullName: string };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
