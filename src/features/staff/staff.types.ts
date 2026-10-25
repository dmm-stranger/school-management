export interface StaffPersonalInfo {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}

export interface Staff {
  _id: string;
  employeeId: string;
  personalInfo: StaffPersonalInfo;
  designation?: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED";
}

export interface ListStaffParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
