import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { libraryApi } from "./library.api";
import type {
  LookupKind,
  LookupPayload,
  ListBooksParams,
  CreateBookPayload,
  UpdateBookPayload,
  CopyStatus,
  ListIssuesParams,
  IssueBookPayload,
  ReturnBookPayload,
  BorrowerType,
  ListFinesParams,
  PaymentMethod,
  UpdateLibrarySettingsPayload,
} from "./library.types";

/** Circulation touches counts, lists, fines and KPIs at once — refresh the whole library cache. */
const useInvalidateLibrary = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.library.root() });
};

/* ---------- lookups ---------- */
export const useLookups = (kind: LookupKind, params: { search?: string; limit?: number } = {}) =>
  useQuery({
    queryKey: queryKeys.library.lookups(kind, params),
    queryFn: () => libraryApi.listLookups(kind, params),
  });

export const useCreateLookup = (kind: LookupKind) => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (payload: LookupPayload) => libraryApi.createLookup(kind, payload), onSuccess: invalidate });
};

export const useUpdateLookup = (kind: LookupKind) => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LookupPayload> }) =>
      libraryApi.updateLookup(kind, id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteLookup = (kind: LookupKind) => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (id: string) => libraryApi.deleteLookup(kind, id), onSuccess: invalidate });
};

/* ---------- books & copies ---------- */
export const useBooks = (params: ListBooksParams = {}) =>
  useQuery({
    queryKey: queryKeys.library.books(params),
    queryFn: () => libraryApi.listBooks(params),
    placeholderData: keepPreviousData, // no flash of empty table while paging/searching
  });

export const useBook = (id: string) =>
  useQuery({ queryKey: queryKeys.library.book(id), queryFn: () => libraryApi.getBook(id), enabled: !!id });

export const useCreateBook = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (payload: CreateBookPayload) => libraryApi.createBook(payload), onSuccess: invalidate });
};

export const useUpdateBook = (id: string) => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (payload: UpdateBookPayload) => libraryApi.updateBook(id, payload), onSuccess: invalidate });
};

export const useDeleteBook = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (id: string) => libraryApi.deleteBook(id), onSuccess: invalidate });
};

export const useAddCopies = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (payload: { bookId: string; count: number }) => libraryApi.addCopies(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateCopy = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CopyStatus }) => libraryApi.updateCopy(id, { status }),
    onSuccess: invalidate,
  });
};

/* ---------- issues ---------- */
export const useIssues = (params: ListIssuesParams = {}) =>
  useQuery({
    queryKey: queryKeys.library.issues(params),
    queryFn: () => libraryApi.listIssues(params),
    placeholderData: keepPreviousData,
  });

export const useMyIssues = (params: { page?: number; limit?: number; status?: string } = {}) =>
  useQuery({ queryKey: queryKeys.library.myIssues(params), queryFn: () => libraryApi.listMyIssues(params) });

export const useBorrowerSearch = (search: string, type?: BorrowerType) =>
  useQuery({
    queryKey: queryKeys.library.borrowers(`${type ?? "ALL"}:${search}`),
    queryFn: () => libraryApi.searchBorrowers(search, type),
    enabled: search.trim().length >= 2,
  });

export const useBorrowerStatus = (userId: string) =>
  useQuery({
    queryKey: queryKeys.library.borrowerStatus(userId),
    queryFn: () => libraryApi.borrowerStatus(userId),
    enabled: !!userId,
    staleTime: 0, // eligibility must be fresh at the moment of issuing
  });

export const useIssueBook = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (payload: IssueBookPayload) => libraryApi.issueBook(payload), onSuccess: invalidate });
};

export const useReturnBook = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnBookPayload }) => libraryApi.returnBook(id, payload),
    onSuccess: invalidate,
  });
};

export const useRenewBook = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({ mutationFn: (id: string) => libraryApi.renewBook(id), onSuccess: invalidate });
};

/* ---------- fines ---------- */
export const useFines = (params: ListFinesParams = {}) =>
  useQuery({
    queryKey: queryKeys.library.fines(params),
    queryFn: () => libraryApi.listFines(params),
    placeholderData: keepPreviousData,
  });

export const usePayFine = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: PaymentMethod }) =>
      libraryApi.payFine(id, paymentMethod),
    onSuccess: invalidate,
  });
};

export const useWaiveFine = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => libraryApi.waiveFine(id, reason),
    onSuccess: invalidate,
  });
};

/* ---------- settings & summary ---------- */
export const useLibrarySettings = () =>
  useQuery({ queryKey: queryKeys.library.settings(), queryFn: libraryApi.getSettings });

export const useUpdateLibrarySettings = () => {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (payload: UpdateLibrarySettingsPayload) => libraryApi.updateSettings(payload),
    onSuccess: invalidate,
  });
};

export const useLibrarySummary = (enabled = true) =>
  useQuery({ queryKey: queryKeys.library.summary(), queryFn: libraryApi.getSummary, enabled });
