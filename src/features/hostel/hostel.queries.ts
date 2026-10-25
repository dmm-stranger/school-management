import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { hostelApi } from "./hostel.api";
import type {
  CreateHostelPayload,
  UpdateHostelPayload,
  CreateRoomPayload,
  BedStatus,
  ListAllocationsParams,
  CreateAllocationPayload,
  ListHostelFeesParams,
  PaymentMethod,
  LogVisitorPayload,
  ListVisitorsParams,
} from "./hostel.types";

const useInvalidateHostel = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.hostel.root() });
};

/* ---------- hostels ---------- */
export const useHostels = (params: { search?: string; status?: string; type?: string } = {}) =>
  useQuery({ queryKey: queryKeys.hostel.hostels(params), queryFn: () => hostelApi.listHostels(params) });

export const useHostel = (id: string) =>
  useQuery({ queryKey: queryKeys.hostel.hostel(id), queryFn: () => hostelApi.getHostel(id), enabled: !!id });

export const useCreateHostel = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (payload: CreateHostelPayload) => hostelApi.createHostel(payload), onSuccess: invalidate });
};

export const useUpdateHostel = (id: string) => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (payload: UpdateHostelPayload) => hostelApi.updateHostel(id, payload), onSuccess: invalidate });
};

export const useDeleteHostel = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (id: string) => hostelApi.deleteHostel(id), onSuccess: invalidate });
};

/* ---------- rooms & beds ---------- */
export const useRoomsForHostel = (hostelId: string) =>
  useQuery({ queryKey: queryKeys.hostel.rooms(hostelId), queryFn: () => hostelApi.listRoomsForHostel(hostelId), enabled: !!hostelId });

export const useRoom = (id: string) =>
  useQuery({ queryKey: queryKeys.hostel.room(id), queryFn: () => hostelApi.getRoom(id), enabled: !!id });

export const useCreateRoom = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (payload: CreateRoomPayload) => hostelApi.createRoom(payload), onSuccess: invalidate });
};

export const useUpdateRoom = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<CreateRoomPayload, "hostelId">> }) => hostelApi.updateRoom(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteRoom = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (id: string) => hostelApi.deleteRoom(id), onSuccess: invalidate });
};

export const useCreateBeds = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ roomId, bedNumbers }: { roomId: string; bedNumbers: string[] }) => hostelApi.createBeds(roomId, bedNumbers),
    onSuccess: invalidate,
  });
};

export const useUpdateBed = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BedStatus }) => hostelApi.updateBed(id, status),
    onSuccess: invalidate,
  });
};

export const useDeleteBed = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (id: string) => hostelApi.deleteBed(id), onSuccess: invalidate });
};

/* ---------- allocations ---------- */
export const useAllocations = (params: ListAllocationsParams = {}) =>
  useQuery({
    queryKey: queryKeys.hostel.allocations(params),
    queryFn: () => hostelApi.listAllocations(params),
    placeholderData: keepPreviousData,
  });

export const useMyAllocation = () => useQuery({ queryKey: queryKeys.hostel.myAllocation(), queryFn: hostelApi.getMyAllocation });

export const useCreateAllocation = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (payload: CreateAllocationPayload) => hostelApi.createAllocation(payload), onSuccess: invalidate });
};

export const useEndAllocation = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => hostelApi.endAllocation(id, remarks),
    onSuccess: invalidate,
  });
};

/* ---------- fees ---------- */
export const useHostelFees = (params: ListHostelFeesParams = {}) =>
  useQuery({ queryKey: queryKeys.hostel.fees(params), queryFn: () => hostelApi.listFees(params), placeholderData: keepPreviousData });

export const usePayHostelFee = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, amount, paymentMethod }: { id: string; amount: number; paymentMethod: PaymentMethod }) =>
      hostelApi.payFee(id, amount, paymentMethod),
    onSuccess: invalidate,
  });
};

export const useAdjustHostelFee = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { discount?: number; fine?: number; reason: string } }) =>
      hostelApi.adjustFee(id, payload),
    onSuccess: invalidate,
  });
};

/* ---------- visitors ---------- */
export const useVisitors = (params: ListVisitorsParams = {}) =>
  useQuery({ queryKey: queryKeys.hostel.visitors(params), queryFn: () => hostelApi.listVisitors(params), placeholderData: keepPreviousData });

export const useLogVisitor = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (payload: LogVisitorPayload) => hostelApi.logVisitor(payload), onSuccess: invalidate });
};

export const useCheckOutVisitor = () => {
  const invalidate = useInvalidateHostel();
  return useMutation({ mutationFn: (id: string) => hostelApi.checkOutVisitor(id), onSuccess: invalidate });
};

/* ---------- summary ---------- */
export const useHostelSummary = (enabled = true) =>
  useQuery({ queryKey: queryKeys.hostel.summary(), queryFn: hostelApi.getSummary, enabled });
