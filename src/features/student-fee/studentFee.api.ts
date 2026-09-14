import { apiClient } from "@/lib/api-client";
import type { StudentFee, CreateStudentFeePayload, CreatePaymentPayload, PaginatedResult } from "./studentFee.types";

export const studentFeeApi = {
  list: () => apiClient.get<PaginatedResult<StudentFee>>("/student-fees?limit=100"),
  create: (payload: CreateStudentFeePayload) => apiClient.post<StudentFee>("/student-fees", payload),
};

export const paymentApi = {
  create: (payload: CreatePaymentPayload) => apiClient.post("/payments", payload),
};
