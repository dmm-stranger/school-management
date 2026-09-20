import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { attendanceSummaryApi } from "./attendanceSummary.api";

/**
 * Plain mutation (not useQuery) — summary is looked up on-demand via a
 * "View Summary" button, matching the existing page's interaction pattern,
 * while still benefiting from cache storage via setQueryData.
 */
export const useYearlyAttendanceSummary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, year }: { studentId: string; year: number }) =>
      attendanceSummaryApi.yearly(studentId, year),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.attendanceSummary.yearly(variables.studentId, variables.year), data);
    },
  });
};
