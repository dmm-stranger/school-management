import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResult,
  Driver,
  CreateDriverPayload,
  UpdateDriverPayload,
  Vehicle,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  TransportRoute,
  TransportRouteDetail,
  CreateRoutePayload,
  UpdateRoutePayload,
  TransportStop,
  CreateStopPayload,
  TransportAssignment,
  ListAssignmentsParams,
  CreateAssignmentPayload,
  TransportFee,
  TransportFeesResult,
  ListTransportFeesParams,
  PaymentMethod,
  MyTransport,
  TransportSummary,
} from "./transport.types";

const toQuery = (params: object = {}): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const transportApi = {
  /* drivers */
  listDrivers: (params: { search?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiClient.get<PaginatedResult<Driver>>(`/drivers${toQuery({ limit: 100, ...params })}`),
  createDriver: (payload: CreateDriverPayload) => apiClient.post<Driver>("/drivers", payload),
  updateDriver: (id: string, payload: UpdateDriverPayload) => apiClient.patch<Driver>(`/drivers/${id}`, payload),
  deleteDriver: (id: string) => apiClient.delete<null>(`/drivers/${id}`),

  /* vehicles */
  listVehicles: (params: { search?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiClient.get<PaginatedResult<Vehicle>>(`/vehicles${toQuery({ limit: 100, ...params })}`),
  getVehicle: (id: string) => apiClient.get<Vehicle>(`/vehicles/${id}`),
  createVehicle: (payload: CreateVehiclePayload) => apiClient.post<Vehicle>("/vehicles", payload),
  updateVehicle: (id: string, payload: UpdateVehiclePayload) => apiClient.patch<Vehicle>(`/vehicles/${id}`, payload),
  deleteVehicle: (id: string) => apiClient.delete<null>(`/vehicles/${id}`),

  /* routes */
  listRoutes: (params: { search?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiClient.get<PaginatedResult<TransportRoute>>(`/transport-routes${toQuery({ limit: 100, ...params })}`),
  getRoute: (id: string) => apiClient.get<TransportRouteDetail>(`/transport-routes/${id}`),
  createRoute: (payload: CreateRoutePayload) => apiClient.post<TransportRoute>("/transport-routes", payload),
  updateRoute: (id: string, payload: UpdateRoutePayload) => apiClient.patch<TransportRoute>(`/transport-routes/${id}`, payload),
  deleteRoute: (id: string) => apiClient.delete<null>(`/transport-routes/${id}`),

  /* stops */
  listStopsForRoute: (routeId: string) => apiClient.get<TransportStop[]>(`/transport-stops/route/${routeId}`),
  createStop: (payload: CreateStopPayload) => apiClient.post<TransportStop>("/transport-stops", payload),
  updateStop: (id: string, payload: Partial<Omit<CreateStopPayload, "routeId">>) =>
    apiClient.patch<TransportStop>(`/transport-stops/${id}`, payload),
  deleteStop: (id: string) => apiClient.delete<null>(`/transport-stops/${id}`),
  reorderStops: (routeId: string, stops: { id: string; sequence: number }[]) =>
    apiClient.patch<TransportStop[]>(`/transport-stops/route/${routeId}/reorder`, { stops }),

  /* assignments */
  listAssignments: (params: ListAssignmentsParams = {}) =>
    apiClient.get<PaginatedResult<TransportAssignment>>(`/transport-assignments${toQuery(params)}`),
  getMyAssignment: () => apiClient.get<MyTransport>("/transport-assignments/my"),
  createAssignment: (payload: CreateAssignmentPayload) =>
    apiClient.post<TransportAssignment>("/transport-assignments", payload),
  endAssignment: (id: string, remarks?: string) =>
    apiClient.post<TransportAssignment>(`/transport-assignments/${id}/end`, { remarks }),

  /* fees */
  listFees: (params: ListTransportFeesParams = {}) =>
    apiClient.get<TransportFeesResult>(`/transport-fees${toQuery(params)}`),
  payFee: (id: string, amount: number, paymentMethod: PaymentMethod) =>
    apiClient.post<TransportFee>(`/transport-fees/${id}/pay`, { amount, paymentMethod }),

  /* summary */
  getSummary: () => apiClient.get<TransportSummary>("/transport-summary"),
};
