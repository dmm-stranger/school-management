import { apiClient } from "@/lib/api-client";
import type { FeeStructure, CreateFeeStructurePayload, PaginatedResult } from "./feeStructure.types";

export const feeStructureApi = {
  list: () => apiClient.get<PaginatedResult<FeeStructure>>("/fee-structures?limit=100"),
  create: (payload: CreateFeeStructurePayload) => apiClient.post<FeeStructure>("/fee-structures", payload),
  delete: (id: string) => apiClient.delete<null>(`/fee-structures/${id}`),
};
