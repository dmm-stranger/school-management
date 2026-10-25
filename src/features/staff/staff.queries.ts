import { useQuery } from "@tanstack/react-query";
import { staffApi } from "./staff.api";
import type { ListStaffParams } from "./staff.types";

export const useStaffList = (params: ListStaffParams = {}, options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: ["staff", "list", params],
    queryFn: () => staffApi.list(params),
    enabled: options.enabled,
  });
