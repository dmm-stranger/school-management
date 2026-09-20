import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { academyApi } from "./academy.api";
import type { CreateRoomPayload, UpdateRoomPayload, ListRoomsParams } from "./academy.types";

export const useRooms = (params: ListRoomsParams = {}) =>
  useQuery({
    queryKey: queryKeys.rooms.all(params),
    queryFn: () => academyApi.list(params),
  });

export const useRoom = (id: string) =>
  useQuery({
    queryKey: queryKeys.rooms.detail(id),
    queryFn: () => academyApi.get(id),
    enabled: !!id,
  });

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => academyApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) => academyApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(variables.id) });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academyApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });
};
