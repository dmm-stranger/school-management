import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { academicYearApi } from "./academicYear.api";
import type { CreateAcademicYearPayload } from "./academicYear.types";

export const useAcademicYears = () =>
  useQuery({
    queryKey: queryKeys.academicYears.all(),
    queryFn: academicYearApi.list,
  });

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAcademicYearPayload) => academicYearApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all() }),
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAcademicYearPayload> }) =>
      academicYearApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all() }),
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all() }),
  });
};
