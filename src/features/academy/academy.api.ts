import { apiClient } from "@/lib/api-client";
import type {
  Room,
  CreateRoomPayload,
  UpdateRoomPayload,
  PaginatedResult,
  ListRoomsParams,
  BuildingSummary,
} from "./academy.types";

const toQueryString = (params: ListRoomsParams) => {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.buildingName) search.set("buildingName", params.buildingName);
  if (params.floor) search.set("floor", params.floor);
  if (params.roomType) search.set("roomType", params.roomType);
  if (params.status) search.set("status", params.status);
  if (params.search) search.set("search", params.search);
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const academyApi = {
  list: (params: ListRoomsParams = {}) =>
    apiClient.get<PaginatedResult<Room>>(`/academies${toQueryString(params)}`),

  get: (id: string) => apiClient.get<Room>(`/academies/${id}`),

  create: (payload: CreateRoomPayload) => apiClient.post<Room>("/academies", payload),

  update: (id: string, payload: UpdateRoomPayload) =>
    apiClient.patch<Room>(`/academies/${id}`, payload),

  delete: (id: string) => apiClient.delete<null>(`/academies/${id}`),

  buildings: () => apiClient.get<BuildingSummary[]>("/academies/buildings"),
};
