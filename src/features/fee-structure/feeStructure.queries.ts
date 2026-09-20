import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { feeStructureApi } from "./feeStructure.api";
import type { CreateFeeStructurePayload } from "./feeStructure.types";

export const useFeeStructures = () =>
  useQuery({
    queryKey: queryKeys.feeStructures.all(),
    queryFn: feeStructureApi.list,
  });

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeStructurePayload) => feeStructureApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.feeStructures.all() }),
  });
};

export const useDeleteFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feeStructureApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.feeStructures.all() }),
  });
};
