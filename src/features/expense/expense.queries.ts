import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { expenseApi } from "./expense.api";
import type { CreateExpensePayload } from "./expense.types";

export const useExpenses = () =>
  useQuery({
    queryKey: queryKeys.expenses.all(),
    queryFn: expenseApi.list,
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => expenseApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() }),
  });
};
