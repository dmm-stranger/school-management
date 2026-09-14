import { apiClient } from "@/lib/api-client";
import type { Expense, CreateExpensePayload, PaginatedResult } from "./expense.types";

export const expenseApi = {
  list: () => apiClient.get<PaginatedResult<Expense>>("/expenses?limit=100"),
  create: (payload: CreateExpensePayload) => apiClient.post<Expense>("/expenses", payload),
};
