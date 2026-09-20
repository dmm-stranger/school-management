import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { academicStructureApi } from "./academicStructure.api";

// Long staleTime — classes/sections/groups are fixed reference data
// (seeded once, not edited via the UI), so there's no need to refetch
// often; this cuts redundant calls across the many forms that use these
// as dropdown data.
const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export const useClasses = () =>
  useQuery({
    queryKey: queryKeys.classes.all(),
    queryFn: academicStructureApi.listClasses,
    staleTime: REFERENCE_STALE_TIME,
  });

export const useSections = (classId?: string) =>
  useQuery({
    queryKey: queryKeys.sections.all(classId),
    queryFn: () => academicStructureApi.listSections(classId),
    staleTime: REFERENCE_STALE_TIME,
  });

export const useGroups = () =>
  useQuery({
    queryKey: queryKeys.groups.all(),
    queryFn: academicStructureApi.listGroups,
    staleTime: REFERENCE_STALE_TIME,
  });
