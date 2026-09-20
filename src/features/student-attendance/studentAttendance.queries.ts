import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { studentAttendanceApi } from "./studentAttendance.api";
import type { BulkAttendancePayload } from "./studentAttendance.types";

export const useAttendanceByClassAndDate = (classId: string, sectionId: string, date: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.studentAttendance.byClassAndDate(classId, sectionId, date),
    queryFn: () => studentAttendanceApi.listByClassAndDate(classId, sectionId, date),
    enabled: !!classId && !!sectionId && !!date && enabled,
  });

export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendancePayload) => studentAttendanceApi.bulkMark(payload),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentAttendance.byClassAndDate(variables.classId, variables.sectionId, variables.date),
      }),
  });
};
