import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResult,
  Hostel,
  HostelDetail,
  CreateHostelPayload,
  UpdateHostelPayload,
  HostelRoom,
  HostelRoomDetail,
  CreateRoomPayload,
  HostelBed,
  BedStatus,
  HostelAllocation,
  ListAllocationsParams,
  CreateAllocationPayload,
  HostelFee,
  HostelFeesResult,
  ListHostelFeesParams,
  PaymentMethod,
  HostelVisitor,
  LogVisitorPayload,
  ListVisitorsParams,
  MyHostel,
  HostelSummary,
} from "./hostel.types";

const toQuery = (params: object = {}): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const hostelApi = {
  /* hostels */
  listHostels: (params: { search?: string; status?: string; type?: string } = {}) =>
    apiClient.get<PaginatedResult<Hostel>>(`/hostels${toQuery({ limit: 100, ...params })}`),
  getHostel: (id: string) => apiClient.get<HostelDetail>(`/hostels/${id}`),
  createHostel: (payload: CreateHostelPayload) => apiClient.post<Hostel>("/hostels", payload),
  updateHostel: (id: string, payload: UpdateHostelPayload) => apiClient.patch<Hostel>(`/hostels/${id}`, payload),
  deleteHostel: (id: string) => apiClient.delete<null>(`/hostels/${id}`),

  /* rooms */
  listRoomsForHostel: (hostelId: string) => apiClient.get<HostelRoom[]>(`/hostel-rooms/hostel/${hostelId}`),
  getRoom: (id: string) => apiClient.get<HostelRoomDetail>(`/hostel-rooms/${id}`),
  createRoom: (payload: CreateRoomPayload) => apiClient.post<HostelRoom>("/hostel-rooms", payload),
  updateRoom: (id: string, payload: Partial<Omit<CreateRoomPayload, "hostelId">>) =>
    apiClient.patch<HostelRoom>(`/hostel-rooms/${id}`, payload),
  deleteRoom: (id: string) => apiClient.delete<null>(`/hostel-rooms/${id}`),

  /* beds */
  listBedsForRoom: (roomId: string) => apiClient.get<HostelBed[]>(`/hostel-beds/room/${roomId}`),
  createBeds: (roomId: string, bedNumbers: string[]) => apiClient.post<HostelBed[]>("/hostel-beds", { roomId, bedNumbers }),
  updateBed: (id: string, status: BedStatus) => apiClient.patch<HostelBed>(`/hostel-beds/${id}`, { status }),
  deleteBed: (id: string) => apiClient.delete<null>(`/hostel-beds/${id}`),

  /* allocations */
  listAllocations: (params: ListAllocationsParams = {}) =>
    apiClient.get<PaginatedResult<HostelAllocation>>(`/hostel-allocations${toQuery(params)}`),
  getMyAllocation: () => apiClient.get<MyHostel>("/hostel-allocations/my"),
  createAllocation: (payload: CreateAllocationPayload) => apiClient.post<HostelAllocation>("/hostel-allocations", payload),
  endAllocation: (id: string, remarks?: string) => apiClient.post<HostelAllocation>(`/hostel-allocations/${id}/end`, { remarks }),

  /* fees */
  listFees: (params: ListHostelFeesParams = {}) => apiClient.get<HostelFeesResult>(`/hostel-fees${toQuery(params)}`),
  payFee: (id: string, amount: number, paymentMethod: PaymentMethod) =>
    apiClient.post<HostelFee>(`/hostel-fees/${id}/pay`, { amount, paymentMethod }),
  adjustFee: (id: string, payload: { discount?: number; fine?: number; reason: string }) =>
    apiClient.patch<HostelFee>(`/hostel-fees/${id}/adjust`, payload),

  /* visitors */
  listVisitors: (params: ListVisitorsParams = {}) => apiClient.get<PaginatedResult<HostelVisitor>>(`/hostel-visitors${toQuery(params)}`),
  logVisitor: (payload: LogVisitorPayload) => apiClient.post<HostelVisitor>("/hostel-visitors", payload),
  checkOutVisitor: (id: string) => apiClient.post<HostelVisitor>(`/hostel-visitors/${id}/checkout`),

  /* summary */
  getSummary: () => apiClient.get<HostelSummary>("/hostel-summary"),
};
