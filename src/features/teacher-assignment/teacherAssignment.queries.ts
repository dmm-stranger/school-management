import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { assignmentApi } from "./teacherAssignment.api";
import type { CreateAssignmentPayload, ListAssignmentsParams } from "./teacherAssignment.types";

export const useTeacherAssignments = (params: ListAssignmentsParams = {}) =>
  useQuery({
    queryKey: queryKeys.teacherAssignments.all(params),
    queryFn: () => assignmentApi.list(params),
  });

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => assignmentApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] }),
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assignmentApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] }),
  });
};
