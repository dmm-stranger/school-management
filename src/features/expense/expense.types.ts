export const EXPENSE_CATEGORIES = [
  "Salary",
  "Electric Bill",
  "Internet Bill",
  "Stationery",
  "Maintenance",
  "Cleaning",
  "Lab Equipment",
  "Fuel",
  "Others",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  _id: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description?: string;
  status: "RECORDED" | "REVERSED";
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  amount: number;
  expenseDate?: string;
  description?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
