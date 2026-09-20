import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { examApi } from "./exam.api";
import type { CreateExamPayload } from "./exam.types";

export const useExams = () =>
  useQuery({
    queryKey: queryKeys.exams.all(),
    queryFn: examApi.list,
  });

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamPayload) => examApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateExamPayload> & { status?: string } }) =>
      examApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
};
