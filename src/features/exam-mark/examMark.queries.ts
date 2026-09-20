import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { examMarkApi } from "./examMark.api";
import type { BulkMarkEntry } from "./examMark.types";

export const useExamMarksBySchedule = (examScheduleId: string) =>
  useQuery({
    queryKey: queryKeys.examMarks.bySchedule(examScheduleId),
    queryFn: () => examMarkApi.listBySchedule(examScheduleId),
    enabled: !!examScheduleId,
  });

export const useBulkCreateMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examScheduleId, marks }: { examScheduleId: string; marks: BulkMarkEntry[] }) =>
      examMarkApi.bulkCreate(examScheduleId, marks),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.examMarks.bySchedule(variables.examScheduleId) }),
  });
};
