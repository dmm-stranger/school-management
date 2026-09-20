import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { teacherApi } from "./teacher.api";

/** Lightweight dropdown list — see teacher.api.ts for scope notes. */
export const useTeachers = () =>
  useQuery({
    queryKey: queryKeys.teachers.all(),
    queryFn: teacherApi.list,
    staleTime: 5 * 60 * 1000, // teacher roster changes rarely; cache longer
  });
