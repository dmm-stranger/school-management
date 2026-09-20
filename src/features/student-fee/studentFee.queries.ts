import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { studentFeeApi, paymentApi } from "./studentFee.api";
import type { CreateStudentFeePayload, CreatePaymentPayload } from "./studentFee.types";

export const useStudentFees = () =>
  useQuery({
    queryKey: queryKeys.studentFees.all(),
    queryFn: studentFeeApi.list,
  });

export const useCreateStudentFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentFeePayload) => studentFeeApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.studentFees.all() }),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.studentFees.all() }),
  });
};
