export interface Subject {
  _id: string;
  subjectCode: string;
  subjectName: string;
  subjectNameBn?: string;
  classId: { _id: string; name: string; level: number } | string;
  group: { _id: string; name: string } | string | null;
  isOptional: boolean;
  bookUrl?: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface CreateSubjectPayload {
  subjectCode: string;
  subjectName: string;
  subjectNameBn?: string;
  classId: string;
  group?: string;
  isOptional?: boolean;
  bookUrl?: string;
  description?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ListSubjectsParams {
  page?: number;
  limit?: number;
  classId?: string;
  group?: string;
  status?: string;
  search?: string;
}
