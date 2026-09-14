"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { Receipt, Plus, AlertCircle, X } from "lucide-react";
import { expenseApi } from "@/features/expense/expense.api";
import type { Expense } from "@/features/expense/expense.types";
import { EXPENSE_CATEGORIES } from "@/features/expense/expense.types";
import type { ExpenseCategory } from "@/features/expense/expense.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiClientError } from "@/lib/api-client";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await expenseApi.list();
      setExpenses(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load expenses.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchExpenses();
    });
  }, [fetchExpenses]);

  const resetForm = () => {
    setCategory("");
    setAmount("");
    setDescription("");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!category) errs.category = "Select a category.";
    const amt = Number(amount);
    if (!amt || amt <= 0) errs.amount = "Amount must be greater than zero.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await expenseApi.create({ category: category as ExpenseCategory, amount: amt, description: description.trim() || undefined });
      resetForm();
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to record expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Expenses</h1>
          <p className="mt-1 text-sm text-muted">Record and track school expenses by category.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Expense"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6"
        >
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
            >
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              required
              placeholder="Select category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              error={formErrors.category}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Amount"
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={formErrors.amount}
              placeholder="2500"
            />
          </div>
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes"
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Recording…" : "Record Expense"}
            </Button>
          </div>
        </form>
      )}

      {loadState === "loaded" && expenses.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
          <p className="text-sm font-medium text-muted">Total Expenses</p>
          <p className="mt-1 text-2xl font-semibold text-heading">৳{total.toLocaleString()}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {loadState === "loading" && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load expenses</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchExpenses}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && expenses.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Receipt className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No expenses recorded yet</p>
            <p className="text-sm text-muted">Add your first expense to get started.</p>
          </div>
        )}

        {loadState === "loaded" && expenses.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">{exp.category}</td>
                  <td className="px-4 py-3 text-muted">৳{exp.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted">{exp.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
