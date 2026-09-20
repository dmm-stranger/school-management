import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { examScheduleApi } from "./examSchedule.api";
import type { CreateSchedulePayload } from "./examSchedule.types";

export const useExamSchedules = (examId?: string) =>
  useQuery({
    queryKey: queryKeys.examSchedules.all(examId),
    queryFn: () => examScheduleApi.list(examId),
  });

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) => examScheduleApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-schedules"] }),
  });
};

export const useAddInvigilator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teacherId, role }: { id: string; teacherId: string; role?: "MAIN" | "ASSISTANT" }) =>
      examScheduleApi.addInvigilator(id, teacherId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-schedules"] }),
  });
};
