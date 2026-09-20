import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { enrollmentApi } from "./studentEnrollment.api";
import type {
  CreateEnrollmentPayload,
  PromotePayload,
  TransferPayload,
  ListEnrollmentsParams,
} from "./studentEnrollment.types";

export const useStudentEnrollments = (params: ListEnrollmentsParams = {}) =>
  useQuery({
    queryKey: queryKeys.studentEnrollments.all(params),
    queryFn: () => enrollmentApi.list(params),
  });

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEnrollmentPayload) => enrollmentApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-enrollments"] }),
  });
};

export const usePromoteEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromotePayload) => enrollmentApi.promote(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-enrollments"] }),
  });
};

export const useTransferEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => enrollmentApi.transfer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-enrollments"] }),
  });
};
