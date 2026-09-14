"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { CreditCard, Plus, AlertCircle, X } from "lucide-react";
import { studentFeeApi, paymentApi } from "@/features/student-fee/studentFee.api";
import type { StudentFee } from "@/features/student-fee/studentFee.types";
import { PAYMENT_METHODS } from "@/features/student-fee/studentFee.types";
import type { PaymentMethod } from "@/features/student-fee/studentFee.types";
import { feeStructureApi } from "@/features/fee-structure/feeStructure.api";
import type { FeeStructure } from "@/features/fee-structure/feeStructure.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { studentApi } from "@/features/student/student.api";
import type { Student } from "@/features/student/student.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

export default function StudentFeesPage() {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [feeStructureId, setFeeStructureId] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [payingFee, setPayingFee] = useState<StudentFee | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod | "">("");
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const fetchFees = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await studentFeeApi.list();
      setFees(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load student fees.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [structureData, yearData, studentData] = await Promise.all([
          feeStructureApi.list(),
          academicYearApi.list(),
          studentApi.list({ limit: 300 }),
        ]);
        setStructures(structureData.data);
        setYears(yearData.data);
        setStudents(studentData.data);
      } catch {
        // dropdowns stay empty
      }
      fetchFees();
    });
  }, [fetchFees]);

  const resetForm = () => {
    setStudentId("");
    setAcademicYearId("");
    setFeeStructureId("");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!studentId) errs.studentId = "Select a student.";
    if (!academicYearId) errs.academicYearId = "Select an academic year.";
    if (!feeStructureId) errs.feeStructureId = "Select a fee structure.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await studentFeeApi.create({ studentId, academicYearId, feeStructureId });
      resetForm();
      setShowForm(false);
      fetchFees();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to assign fee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPayment = (fee: StudentFee) => {
    setPayingFee(fee);
    setPayAmount(String(fee.dueAmount));
    setPayMethod("");
    setPayError(null);
  };

  const submitPayment = async () => {
    if (!payingFee) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      setPayError("Enter a valid amount.");
      return;
    }
    if (amt > payingFee.dueAmount) {
      setPayError(`Amount cannot exceed the due amount (৳${payingFee.dueAmount}).`);
      return;
    }
    if (!payMethod) {
      setPayError("Select a payment method.");
      return;
    }

    setIsPaying(true);
    setPayError(null);
    try {
      await paymentApi.create({ studentFeeId: payingFee._id, paymentMethod: payMethod, amount: amt });
      setPayingFee(null);
      fetchFees();
    } catch (err) {
      setPayError(err instanceof ApiClientError ? err.message : "Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Student Fees</h1>
          <p className="mt-1 text-sm text-muted">Assign fees to students and record payments.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Assign Fee"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Student"
              required
              placeholder="Select student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              error={formErrors.studentId}
              options={students.map((s) => ({ value: s._id, label: `${s.personalInfo.fullName} (${s.studentId})` }))}
            />
            <Select
              label="Academic Year"
              required
              placeholder="Select year"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              error={formErrors.academicYearId}
              options={years.map((y) => ({ value: y._id, label: y.year }))}
            />
            <Select
              label="Fee Structure"
              required
              placeholder="Select fee"
              value={feeStructureId}
              onChange={(e) => setFeeStructureId(e.target.value)}
              error={formErrors.feeStructureId}
              options={structures.map((s) => ({ value: s._id, label: `${s.name} (৳${s.amount})` }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Assigning…" : "Assign Fee"}
            </Button>
          </div>
        </form>
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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load student fees</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchFees}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && fees.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <CreditCard className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No fees assigned yet</p>
            <p className="text-sm text-muted">Assign a fee to a student to get started.</p>
          </div>
        )}

        {loadState === "loaded" && fees.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {fees.map((fee) => (
                <tr key={fee._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">
                    {typeof fee.studentId === "string" ? fee.studentId : fee.studentId.personalInfo.fullName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {typeof fee.feeStructureId === "string" ? fee.feeStructureId : fee.feeStructureId.name}
                  </td>
                  <td className="px-4 py-3 text-muted">৳{fee.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted">৳{fee.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-heading">৳{fee.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={fee.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fee.dueAmount > 0 && fee.status !== "CANCELLED" && (
                      <button
                        onClick={() => openPayment(fee)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {payingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-heading">Record Payment</h2>
            <p className="mt-1 text-sm text-muted">Due amount: ৳{payingFee.dueAmount.toLocaleString()}</p>

            {payError && (
              <div
                role="alert"
                className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
              >
                {payError}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Amount"
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <Select
                label="Payment Method"
                required
                placeholder="Select method"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                options={PAYMENT_METHODS.map((m) => ({ value: m, label: m.replace(/_/g, " ") }))}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPayingFee(null)}>
                Cancel
              </Button>
              <Button onClick={submitPayment} isLoading={isPaying}>
                {isPaying ? "Processing…" : "Record Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
