export interface TeacherAssignment {
  _id: string;
  teacherId: { _id: string; employeeId: string; personalInfo: { fullName: string } } | string;
  academicYearId: { _id: string; year: string } | string;
  classId: { _id: string; name: string; level: number } | string;
  sectionId: { _id: string; name: string } | string;
  groupId: { _id: string; name: string } | string | null;
  subjectId: { _id: string; subjectName: string; subjectCode: string } | string;
  isClassTeacher: boolean;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  remarks?: string;
}

export interface CreateAssignmentPayload {
  teacherId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  groupId?: string;
  subjectId: string;
  isClassTeacher?: boolean;
  remarks?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ListAssignmentsParams {
  page?: number;
  limit?: number;
  classId?: string;
  sectionId?: string;
  teacherId?: string;
  academicYearId?: string;
}
