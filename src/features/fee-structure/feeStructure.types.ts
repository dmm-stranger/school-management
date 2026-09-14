export interface FeeStructure {
  _id: string;
  name: string;
  academicYearId: { _id: string; year: string } | string;
  classId: { _id: string; name: string } | string;
  groupId: { _id: string; name: string } | string | null;
  amount: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateFeeStructurePayload {
  name: string;
  academicYearId: string;
  classId: string;
  groupId?: string;
  amount: number;
  description?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
