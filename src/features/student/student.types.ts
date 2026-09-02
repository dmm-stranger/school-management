export interface StudentPersonalInfo {
  nickname?: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  bloodGroup?: string;
  nationalId?: string;
  photo?: string;
}

export interface StudentContactInfo {
  phone: string;
  email?: string;
  division?: string;
  district?: string;
  upazila?: string;
  postalCode?: string;
  presentAddress?: string;
  permanentAddress?: string;
}

export type StudentStatus = "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED" | "SUSPENDED";

export interface Student {
  _id: string;
  studentId: string;
  personalInfo: StudentPersonalInfo;
  contactInfo: StudentContactInfo;
  status: StudentStatus;
  joiningDate: string;
  userId: {
    _id: string;
    email: string;
    accountStatus: string;
    emailVerified: boolean;
  };
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ListStudentsParams {
  page?: number;
  limit?: number;
  status?: StudentStatus;
  search?: string;
  sort?: string;
}
