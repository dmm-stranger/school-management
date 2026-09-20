import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { routineApi } from "./routine.api";
import type { RoutineScope, GenerateRoutinePayload } from "./routine.types";

export const usePeriods = () =>
  useQuery({
    queryKey: queryKeys.routine.periods(),
    queryFn: routineApi.listPeriods,
    staleTime: 10 * 60 * 1000, // period config changes essentially never
  });

export const useRoutineByClass = (classId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.routine.byClass(classId),
    queryFn: () => routineApi.listByClass(classId),
    enabled: !!classId && enabled,
  });

const invalidateRoutine = (queryClient: ReturnType<typeof useQueryClient>, classId?: string) => {
  queryClient.invalidateQueries({ queryKey: ["routine"] });
  if (classId) queryClient.invalidateQueries({ queryKey: queryKeys.routine.byClass(classId) });
};

export const useGenerateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateRoutinePayload) => routineApi.generate(payload),
    onSuccess: (_data, variables) => invalidateRoutine(queryClient, variables.classId),
  });
};

export const usePublishRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scope: RoutineScope) => routineApi.publish(scope),
    onSuccess: (_data, variables) => invalidateRoutine(queryClient, variables.classId),
  });
};

export const useLockRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scope: RoutineScope) => routineApi.lock(scope),
    onSuccess: (_data, variables) => invalidateRoutine(queryClient, variables.classId),
  });
};

export const useUnlockRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scope: RoutineScope) => routineApi.unlock(scope),
    onSuccess: (_data, variables) => invalidateRoutine(queryClient, variables.classId),
  });
};

export const useCheckRoutineConflicts = () =>
  useMutation({
    mutationFn: (scope: RoutineScope) => routineApi.checkConflicts(scope),
  });
