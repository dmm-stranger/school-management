export type EnrollmentStatus = "PENDING" | "ACTIVE" | "PROMOTED" | "TRANSFERRED" | "COMPLETED" | "DROPPED";

export interface StudentEnrollment {
  _id: string;
  studentId: { _id: string; studentId: string; personalInfo: { fullName: string } } | string;
  academicYearId: { _id: string; year: string } | string;
  classId: { _id: string; name: string; level: number } | string;
  sectionId: { _id: string; name: string } | string;
  groupId: { _id: string; name: string } | string | null;
  rollNumber: string;
  status: EnrollmentStatus;
  admissionDate: string;
  remarks?: string;
}

export interface CreateEnrollmentPayload {
  studentId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  groupId?: string;
  rollNumber: string;
}

export interface PromotePayload {
  enrollmentId: string;
  toAcademicYearId: string;
  toClassId: string;
  toSectionId: string;
  toGroupId?: string;
  rollNumber: string;
}

export interface TransferPayload {
  enrollmentId: string;
  toClassId: string;
  toSectionId: string;
  toGroupId?: string;
  rollNumber: string;
  remarks?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ListEnrollmentsParams {
  page?: number;
  limit?: number;
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
  status?: EnrollmentStatus;
}
