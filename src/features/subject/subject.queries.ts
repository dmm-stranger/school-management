import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { subjectApi } from "./subject.api";
import type { CreateSubjectPayload, ListSubjectsParams } from "./subject.types";

export const useSubjects = (params: ListSubjectsParams = {}) =>
  useQuery({
    queryKey: queryKeys.subjects.all(params),
    queryFn: () => subjectApi.list(params),
  });

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => subjectApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSubjectPayload> }) =>
      subjectApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
};
