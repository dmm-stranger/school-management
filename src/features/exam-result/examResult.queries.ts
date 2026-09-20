import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { examResultApi } from "./examResult.api";
import type { GenerateResultsPayload } from "./examResult.types";

export const useGenerateResults = () =>
  useMutation({
    mutationFn: (payload: GenerateResultsPayload) => examResultApi.generate(payload),
  });

export const usePublishResults = () =>
  useMutation({
    mutationFn: (examId: string) => examResultApi.publish(examId),
  });

/**
 * Kept as a plain mutation (not useQuery) since results are looked up
 * on-demand by an admin picking a student, not rendered automatically on
 * page load — matches the existing "View Results" button pattern.
 */
export const useStudentResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => examResultApi.listByStudent(studentId),
    onSuccess: (data, studentId) => {
      queryClient.setQueryData(queryKeys.examResults.byStudent(studentId), data);
    },
  });
};
