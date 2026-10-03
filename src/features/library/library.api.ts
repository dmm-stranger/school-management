import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResult,
  LookupKind,
  LookupRecord,
  LookupPayload,
  Book,
  BookDetail,
  BookCopy,
  CopyStatus,
  CreateBookPayload,
  UpdateBookPayload,
  ListBooksParams,
  BookIssue,
  ListIssuesParams,
  IssueBookPayload,
  ReturnBookPayload,
  ReturnBookResult,
  BorrowerSearchResult,
  BorrowerStatus,
  BorrowerType,
  LibraryFine,
  FinesResult,
  ListFinesParams,
  PaymentMethod,
  LibrarySettings,
  UpdateLibrarySettingsPayload,
  LibrarySummary,
} from "./library.types";

/** Builds ?a=1&b=2, skipping empty values so cache keys and URLs stay clean. */
const toQuery = (params: object = {}): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const libraryApi = {
  /* lookups */
  listLookups: (kind: LookupKind, params: { search?: string; limit?: number } = {}) =>
    apiClient.get<PaginatedResult<LookupRecord>>(`/${kind}${toQuery({ limit: 100, ...params })}`),
  createLookup: (kind: LookupKind, payload: LookupPayload) => apiClient.post<LookupRecord>(`/${kind}`, payload),
  updateLookup: (kind: LookupKind, id: string, payload: Partial<LookupPayload>) =>
    apiClient.patch<LookupRecord>(`/${kind}/${id}`, payload),
  deleteLookup: (kind: LookupKind, id: string) => apiClient.delete<null>(`/${kind}/${id}`),

  /* books */
  listBooks: (params: ListBooksParams = {}) => apiClient.get<PaginatedResult<Book>>(`/books${toQuery(params)}`),
  getBook: (id: string) => apiClient.get<BookDetail>(`/books/${id}`),
  createBook: (payload: CreateBookPayload) => apiClient.post<Book>("/books", payload),
  updateBook: (id: string, payload: UpdateBookPayload) => apiClient.patch<Book>(`/books/${id}`, payload),
  deleteBook: (id: string) => apiClient.delete<null>(`/books/${id}`),

  /* copies */
  addCopies: (payload: { bookId: string; count: number }) => apiClient.post<BookCopy[]>("/book-copies", payload),
  updateCopy: (id: string, payload: { status?: CopyStatus; notes?: string }) =>
    apiClient.patch<BookCopy>(`/book-copies/${id}`, payload),

  /* issues */
  listIssues: (params: ListIssuesParams = {}) =>
    apiClient.get<PaginatedResult<BookIssue>>(`/book-issues${toQuery(params)}`),
  listMyIssues: (params: { page?: number; limit?: number; status?: string } = {}) =>
    apiClient.get<PaginatedResult<BookIssue>>(`/book-issues/my${toQuery(params)}`),
  issueBook: (payload: IssueBookPayload) => apiClient.post<BookIssue>("/book-issues", payload),
  returnBook: (id: string, payload: ReturnBookPayload) =>
    apiClient.post<ReturnBookResult>(`/book-issues/${id}/return`, payload),
  renewBook: (id: string) => apiClient.post<BookIssue>(`/book-issues/${id}/renew`),
  searchBorrowers: (search: string, type?: BorrowerType) =>
    apiClient.get<BorrowerSearchResult[]>(`/book-issues/borrowers/search${toQuery({ search, type })}`),
  borrowerStatus: (userId: string) => apiClient.get<BorrowerStatus>(`/book-issues/borrowers/${userId}/status`),

  /* fines */
  listFines: (params: ListFinesParams = {}) => apiClient.get<FinesResult>(`/library-fines${toQuery(params)}`),
  payFine: (id: string, paymentMethod: PaymentMethod) =>
    apiClient.post<LibraryFine>(`/library-fines/${id}/pay`, { paymentMethod }),
  waiveFine: (id: string, reason: string) => apiClient.post<LibraryFine>(`/library-fines/${id}/waive`, { reason }),

  /* settings & summary */
  getSettings: () => apiClient.get<LibrarySettings>("/library-settings"),
  updateSettings: (payload: UpdateLibrarySettingsPayload) =>
    apiClient.patch<LibrarySettings>("/library-settings", payload),
  getSummary: () => apiClient.get<LibrarySummary>("/library-summary"),
};
