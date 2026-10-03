export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface NamedRef {
  _id: string;
  name: string;
}

/* ---------- Catalog lookups (categories / authors / publishers) ---------- */

export type LookupKind = "book-categories" | "authors" | "publishers";

export interface LookupRecord {
  _id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  description?: string | null; // categories
  bio?: string | null; // authors
  address?: string | null; // publishers
  phone?: string | null;
  email?: string | null;
}

export type LookupPayload = Partial<Omit<LookupRecord, "_id">> & { name: string };

/* ---------- Books & copies ---------- */

export interface Book {
  _id: string;
  title: string;
  subtitle?: string | null;
  isbn?: string | null;
  categoryId: NamedRef | string;
  authorIds: NamedRef[];
  publisherId: NamedRef | string | null;
  edition?: string | null;
  publishedYear?: number | null;
  language?: string | null;
  description?: string | null;
  shelfLocation?: string | null;
  price?: number | null;
  status: "ACTIVE" | "INACTIVE";
  copies: { total: number; available: number };
}

export type CopyStatus = "AVAILABLE" | "ISSUED" | "LOST" | "DAMAGED" | "MAINTENANCE" | "RETIRED";
export const MANUAL_COPY_STATUSES: CopyStatus[] = ["AVAILABLE", "MAINTENANCE", "DAMAGED", "LOST", "RETIRED"];

export interface BookCopy {
  _id: string;
  bookId: string;
  barcode: string;
  status: CopyStatus;
  acquiredDate?: string;
  notes?: string | null;
}

export interface BookDetail extends Book {
  copyList: BookCopy[];
}

export interface CreateBookPayload {
  title: string;
  subtitle?: string;
  isbn?: string;
  categoryId: string;
  authorIds: string[];
  publisherId?: string;
  edition?: string;
  publishedYear?: number;
  language?: string;
  description?: string;
  shelfLocation?: string;
  price?: number;
  initialCopies?: number;
}

export type UpdateBookPayload = Partial<Omit<CreateBookPayload, "initialCopies">> & {
  status?: "ACTIVE" | "INACTIVE";
};

export interface ListBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  authorId?: string;
  availableOnly?: boolean;
  status?: "ACTIVE" | "INACTIVE";
}

/* ---------- Issues ---------- */

export type BorrowerType = "STUDENT" | "TEACHER" | "STAFF";
export type IssueStatus = "ISSUED" | "RETURNED" | "LOST";
export type ReturnCondition = "GOOD" | "DAMAGED" | "LOST";

export interface BookIssue {
  _id: string;
  bookId: string;
  copyId: string;
  bookTitle: string;
  barcode: string;
  borrowerId: string;
  borrowerType: BorrowerType;
  borrower: { name: string; code: string | null; profileId: string };
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: IssueStatus;
  renewalCount: number;
  fineAmount: number;
  returnCondition: ReturnCondition | null;
  remarks?: string | null;
  // derived by the backend on read
  isOverdue: boolean;
  overdueDays: number;
  projectedFine: number;
}

export interface ListIssuesParams {
  page?: number;
  limit?: number;
  status?: IssueStatus;
  overdue?: boolean;
  search?: string;
  borrowerId?: string;
}

export interface IssueBookPayload {
  barcode: string;
  borrowerId: string;
  remarks?: string;
}

export interface ReturnBookPayload {
  condition: ReturnCondition;
  damageFine?: number;
  remarks?: string;
}

export interface ReturnBookResult {
  issue: BookIssue;
  fines: LibraryFine[];
}

export interface BorrowerSearchResult {
  userId: string;
  name: string;
  code: string | null;
  type: BorrowerType;
}

export interface BorrowerStatus {
  userId: string;
  borrowerType: BorrowerType;
  borrower: { name: string; code: string | null; profileId: string };
  maxBooks: number;
  loanDays: number;
  activeCount: number;
  overdueCount: number;
  pendingFineTotal: number;
  pendingFineCount: number;
  canBorrow: boolean;
  reasons: string[];
}

/* ---------- Fines ---------- */

export type FineStatus = "PENDING" | "PAID" | "WAIVED";
export type FineReason = "OVERDUE" | "DAMAGED" | "LOST";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD" | "ONLINE_PAYMENT" | "CHEQUE";

export interface LibraryFine {
  _id: string;
  issueId: string;
  borrowerId: string;
  borrowerName: string;
  bookTitle: string;
  reason: FineReason;
  daysOverdue: number;
  amount: number;
  status: FineStatus;
  paymentMethod?: string | null;
  paidAt?: string | null;
  receiptNumber?: string | null;
  waiveReason?: string | null;
  createdAt: string;
}

export interface FinesResult extends PaginatedResult<LibraryFine> {
  pendingTotal: number;
}

export interface ListFinesParams {
  page?: number;
  limit?: number;
  status?: FineStatus;
  reason?: FineReason;
  search?: string;
}

/* ---------- Settings & summary ---------- */

export interface BorrowLimit {
  maxBooks: number;
  loanDays: number;
}

export interface LibrarySettings {
  borrowLimits: Record<BorrowerType, BorrowLimit>;
  finePerDay: number;
  maxFinePerIssue: number | null;
  maxRenewals: number;
  lostBookUsePrice: boolean;
  lostBookFlatFine: number;
  blockIssueWithPendingFines: boolean;
}

export type UpdateLibrarySettingsPayload = Partial<
  Omit<LibrarySettings, "borrowLimits"> & { borrowLimits: Partial<Record<BorrowerType, Partial<BorrowLimit>>> }
>;

export interface LibrarySummary {
  titles: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  unavailableCopies: number;
  activeIssues: number;
  overdueIssues: number;
  issuedToday: number;
  returnedToday: number;
  pendingFineTotal: number;
  pendingFineCount: number;
  mostBorrowed: { bookId: string; title: string; issues: number }[];
}
