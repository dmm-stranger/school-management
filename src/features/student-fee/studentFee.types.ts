export type StudentFeeStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";

export interface StudentFee {
  _id: string;
  studentId: { _id: string; studentId: string; personalInfo: { fullName: string } } | string;
  academicYearId: { _id: string; year: string } | string;
  feeStructureId: { _id: string; name: string; amount: number } | string;
  amount: number;
  discount: number;
  fine: number;
  paidAmount: number;
  dueAmount: number;
  status: StudentFeeStatus;
}

export interface CreateStudentFeePayload {
  studentId: string;
  academicYearId: string;
  feeStructureId: string;
  discount?: number;
  fine?: number;
}

export const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "MOBILE_BANKING",
  "CARD",
  "ONLINE_PAYMENT",
  "CHEQUE",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface CreatePaymentPayload {
  studentFeeId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  amount: number;
  remarks?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
