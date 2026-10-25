export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface NamedRef {
  _id: string;
  name: string;
}

export type FeeFrequency = "MONTHLY" | "TERM" | "ANNUAL";

/* ---------- Hostel ---------- */

export type HostelType = "BOYS" | "GIRLS" | "MIXED";

export interface HostelWardenRef {
  _id: string;
  personalInfo: { fullName: string };
  designation?: string;
}

export interface Hostel {
  _id: string;
  name: string;
  type: HostelType;
  address?: string | null;
  wardenId: HostelWardenRef | string | null;
  fee: number;
  feeFrequency: FeeFrequency;
  status: "ACTIVE" | "INACTIVE";
}

export interface HostelDetail extends Hostel {
  roomCount: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

export interface CreateHostelPayload {
  name: string;
  type: HostelType;
  address?: string;
  wardenId?: string;
  fee: number;
  feeFrequency?: FeeFrequency;
}
export type UpdateHostelPayload = Partial<Omit<CreateHostelPayload, "wardenId">> & {
  status?: "ACTIVE" | "INACTIVE";
  wardenId?: string | null;
};

/* ---------- Rooms & beds ---------- */

export interface HostelRoom {
  _id: string;
  hostelId: string;
  roomNumber: string;
  floor?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface HostelRoomDetail extends HostelRoom {
  beds: HostelBed[];
}

export type BedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RETIRED";
export const MANUAL_BED_STATUSES: BedStatus[] = ["AVAILABLE", "MAINTENANCE", "RETIRED"];

export interface HostelBed {
  _id: string;
  hostelId: string;
  roomId: string;
  bedNumber: string;
  status: BedStatus;
}

export interface CreateRoomPayload {
  hostelId: string;
  roomNumber: string;
  floor?: string;
}

/* ---------- Allocations ---------- */

export type AllocationStatus = "ACTIVE" | "ENDED" | "CANCELLED";

export interface AllocationStudentRef {
  _id: string;
  personalInfo: { fullName: string };
  studentId: string;
}

export interface HostelAllocation {
  _id: string;
  studentId: AllocationStudentRef | string;
  hostelId: NamedRef | string;
  roomId: { _id: string; roomNumber: string; floor?: string | null } | string;
  bedId: { _id: string; bedNumber: string } | string;
  status: AllocationStatus;
  startDate: string;
  endDate: string | null;
  remarks?: string | null;
}

export interface ListAllocationsParams {
  page?: number;
  limit?: number;
  status?: AllocationStatus;
  hostelId?: string;
  roomId?: string;
  search?: string;
}

export interface CreateAllocationPayload {
  studentId: string;
  roomId: string;
  bedId: string;
  remarks?: string;
}

/* ---------- Fees ---------- */

export type HostelFeeStatus = "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD" | "ONLINE_PAYMENT" | "CHEQUE";

export interface FeeAdjustment {
  field: "discount" | "fine";
  previousValue: number;
  newValue: number;
  reason?: string | null;
  changedAt: string;
}

export interface HostelFeeStudentRef {
  _id: string;
  personalInfo: { fullName: string };
  studentId: string;
}

export interface HostelFee {
  _id: string;
  studentId: HostelFeeStudentRef | string;
  allocationId: string;
  hostelId: NamedRef | string;
  amount: number;
  feeFrequency: FeeFrequency;
  discount: number;
  fine: number;
  paidAmount: number;
  dueAmount: number;
  status: HostelFeeStatus;
  adjustments: FeeAdjustment[];
  createdAt: string;
}

export interface HostelFeesResult extends PaginatedResult<HostelFee> {
  pendingTotal: number;
}

export interface ListHostelFeesParams {
  page?: number;
  limit?: number;
  status?: HostelFeeStatus;
  search?: string;
}

/* ---------- Visitors ---------- */

export interface VisitorStudentRef {
  _id: string;
  personalInfo: { fullName: string };
  studentId: string;
}

export interface HostelVisitor {
  _id: string;
  studentId: VisitorStudentRef | string;
  hostelId: string;
  visitorName: string;
  visitorPhone?: string | null;
  relation?: string | null;
  purpose?: string | null;
  checkInTime: string;
  checkOutTime: string | null;
}

export interface LogVisitorPayload {
  studentId: string;
  visitorName: string;
  visitorPhone?: string;
  relation?: string;
  purpose?: string;
}

export interface ListVisitorsParams {
  page?: number;
  limit?: number;
  studentId?: string;
  hostelId?: string;
  activeOnly?: boolean;
}

/* ---------- My hostel (student self-service) ---------- */

export interface MyHostel {
  allocation: HostelAllocation | null;
  fees: HostelFee[];
}

/* ---------- Summary ---------- */

export interface HostelSummary {
  hostelCount: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  activeAllocations: number;
  pendingFeeTotal: number;
  pendingFeeCount: number;
  visitorsOnSite: number;
}
