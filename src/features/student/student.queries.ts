import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { studentApi } from "./student.api";
import type { ListStudentsParams } from "./student.types";

export const useStudents = (params: ListStudentsParams = {}) =>
  useQuery({
    queryKey: queryKeys.students.all(params),
    queryFn: () => studentApi.list(params),
  });

export const useStudent = (id: string) =>
  useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentApi.get(id),
    enabled: !!id,
  });

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
};
