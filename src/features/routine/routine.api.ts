import { apiClient } from "@/lib/api-client";
import type { Period, RoutineEntry, RoutineScope, GenerateRoutinePayload, Conflict } from "./routine.types";

const scopeQuery = (scope: RoutineScope) => {
  const search = new URLSearchParams();
  search.set("academicYearId", scope.academicYearId);
  search.set("classId", scope.classId);
  search.set("sectionId", scope.sectionId);
  if (scope.groupId) search.set("groupId", scope.groupId);
  return search.toString();
};

export const routineApi = {
  listPeriods: () => apiClient.get<Period[]>("/periods"),

  listByClass: (classId: string) => apiClient.get<RoutineEntry[]>(`/class-routines/class/${classId}`),

  generate: (payload: GenerateRoutinePayload) =>
    apiClient.post<{ created: RoutineEntry[]; skipped: unknown[] }>("/class-routines/generate", payload),

  publish: (scope: RoutineScope) =>
    apiClient.post<{ published: number }>("/class-routines/publish", scope),

  lock: (scope: RoutineScope) => apiClient.post<{ locked: number }>("/class-routines/lock", scope),

  unlock: (scope: RoutineScope) => apiClient.post<{ unlocked: number }>("/class-routines/unlock", scope),

  checkConflicts: (scope: RoutineScope) =>
    apiClient.get<Conflict[]>(`/class-routines/conflicts?${scopeQuery(scope)}`),

  delete: (id: string) => apiClient.delete<null>(`/class-routines/${id}`),
};
