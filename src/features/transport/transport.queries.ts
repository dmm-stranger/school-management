import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { transportApi } from "./transport.api";
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  CreateRoutePayload,
  UpdateRoutePayload,
  CreateStopPayload,
  ListAssignmentsParams,
  CreateAssignmentPayload,
  ListTransportFeesParams,
  PaymentMethod,
} from "./transport.types";

const useInvalidateTransport = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.transport.root() });
};

/* ---------- drivers ---------- */
export const useDrivers = (params: { search?: string; status?: string } = {}) =>
  useQuery({ queryKey: queryKeys.transport.drivers(params), queryFn: () => transportApi.listDrivers(params) });

export const useCreateDriver = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (payload: CreateDriverPayload) => transportApi.createDriver(payload), onSuccess: invalidate });
};

export const useUpdateDriver = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDriverPayload }) => transportApi.updateDriver(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteDriver = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (id: string) => transportApi.deleteDriver(id), onSuccess: invalidate });
};

/* ---------- vehicles ---------- */
export const useVehicles = (params: { search?: string; status?: string } = {}) =>
  useQuery({ queryKey: queryKeys.transport.vehicles(params), queryFn: () => transportApi.listVehicles(params) });

export const useVehicle = (id: string) =>
  useQuery({ queryKey: queryKeys.transport.vehicle(id), queryFn: () => transportApi.getVehicle(id), enabled: !!id });

export const useCreateVehicle = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (payload: CreateVehiclePayload) => transportApi.createVehicle(payload), onSuccess: invalidate });
};

export const useUpdateVehicle = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePayload }) => transportApi.updateVehicle(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteVehicle = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (id: string) => transportApi.deleteVehicle(id), onSuccess: invalidate });
};

/* ---------- routes & stops ---------- */
export const useRoutes = (params: { search?: string; status?: string } = {}) =>
  useQuery({ queryKey: queryKeys.transport.routes(params), queryFn: () => transportApi.listRoutes(params) });

export const useRoute = (id: string) =>
  useQuery({ queryKey: queryKeys.transport.route(id), queryFn: () => transportApi.getRoute(id), enabled: !!id });

export const useCreateRoute = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (payload: CreateRoutePayload) => transportApi.createRoute(payload), onSuccess: invalidate });
};

export const useUpdateRoute = (id: string) => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (payload: UpdateRoutePayload) => transportApi.updateRoute(id, payload), onSuccess: invalidate });
};

export const useDeleteRoute = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (id: string) => transportApi.deleteRoute(id), onSuccess: invalidate });
};

export const useCreateStop = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (payload: CreateStopPayload) => transportApi.createStop(payload), onSuccess: invalidate });
};

export const useUpdateStop = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<CreateStopPayload, "routeId">> }) =>
      transportApi.updateStop(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteStop = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({ mutationFn: (id: string) => transportApi.deleteStop(id), onSuccess: invalidate });
};

export const useReorderStops = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: ({ routeId, stops }: { routeId: string; stops: { id: string; sequence: number }[] }) =>
      transportApi.reorderStops(routeId, stops),
    onSuccess: invalidate,
  });
};

/* ---------- assignments ---------- */
export const useAssignments = (params: ListAssignmentsParams = {}) =>
  useQuery({
    queryKey: queryKeys.transport.assignments(params),
    queryFn: () => transportApi.listAssignments(params),
    placeholderData: keepPreviousData,
  });

export const useMyAssignment = () =>
  useQuery({ queryKey: queryKeys.transport.myAssignment(), queryFn: transportApi.getMyAssignment });

export const useCreateAssignment = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => transportApi.createAssignment(payload),
    onSuccess: invalidate,
  });
};

export const useEndAssignment = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => transportApi.endAssignment(id, remarks),
    onSuccess: invalidate,
  });
};

/* ---------- fees ---------- */
export const useTransportFees = (params: ListTransportFeesParams = {}) =>
  useQuery({
    queryKey: queryKeys.transport.fees(params),
    queryFn: () => transportApi.listFees(params),
    placeholderData: keepPreviousData,
  });

export const usePayTransportFee = () => {
  const invalidate = useInvalidateTransport();
  return useMutation({
    mutationFn: ({ id, amount, paymentMethod }: { id: string; amount: number; paymentMethod: PaymentMethod }) =>
      transportApi.payFee(id, amount, paymentMethod),
    onSuccess: invalidate,
  });
};

/* ---------- summary ---------- */
export const useTransportSummary = (enabled = true) =>
  useQuery({ queryKey: queryKeys.transport.summary(), queryFn: transportApi.getSummary, enabled });
