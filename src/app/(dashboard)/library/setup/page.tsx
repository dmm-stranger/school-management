"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useLookups, useCreateLookup, useUpdateLookup, useDeleteLookup } from "@/features/library/library.queries";
import type { LookupKind, LookupRecord } from "@/features/library/library.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { messageFrom, fieldErrorsFrom } from "@/lib/form-errors";

const TABS: { kind: LookupKind; label: string; extra: ("description" | "bio" | "address" | "phone" | "email")[] }[] = [
  { kind: "book-categories", label: "Categories", extra: ["description"] },
  { kind: "authors", label: "Authors", extra: ["bio"] },
  { kind: "publishers", label: "Publishers", extra: ["address", "phone", "email"] },
];

const FIELD_LABEL: Record<string, string> = {
  description: "Description",
  bio: "Bio",
  address: "Address",
  phone: "Phone",
  email: "Email",
};

function LookupForm({
  kind,
  extraFields,
  record,
  onDone,
}: {
  kind: LookupKind;
  extraFields: string[];
  record: LookupRecord | null;
  onDone: () => void;
}) {
  const create = useCreateLookup(kind);
  const update = useUpdateLookup(kind);
  const [name, setName] = useState(record?.name ?? "");
  const [extras, setExtras] = useState<Record<string, string>>(
    Object.fromEntries(extraFields.map((f) => [f, (record?.[f as keyof LookupRecord] as string) ?? ""]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;
  const apiError = create.error || update.error;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Name is required." });
      return;
    }
    const payload = { name: name.trim(), ...Object.fromEntries(Object.entries(extras).map(([k, v]) => [k, v.trim() || undefined])) };
    try {
      if (record) {
        await update.mutateAsync({ id: record._id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      onDone();
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      {extraFields.map((f) => (
        <Input
          key={f}
          label={FIELD_LABEL[f]}
          type={f === "email" ? "email" : "text"}
          value={extras[f] ?? ""}
          onChange={(e) => setExtras((cur) => ({ ...cur, [f]: e.target.value }))}
          error={errors[f]}
        />
      ))}
      {apiError && Object.keys(errors).length === 0 && (
        <p role="alert" className="text-sm text-danger">
          {messageFrom(apiError, "That didn't work. Please try again.")}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={pending}>
          {record ? "Save Changes" : "Add"}
        </Button>
      </div>
    </form>
  );
}

export default function LibrarySetupPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState<"create" | LookupRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LookupRecord | null>(null);
  const tab = TABS[activeTab];

  const { data, isLoading, isError, error, refetch } = useLookups(tab.kind);
  const deleteLookup = useDeleteLookup(tab.kind);

  const switchTab = (i: number) => {
    setActiveTab(i);
    setModal(null);
    setConfirmDelete(null);
  };

  const handleDelete = async (record: LookupRecord) => {
    try {
      await deleteLookup.mutateAsync(record._id);
      setConfirmDelete(null);
    } catch {
      // error banner below stays visible via deleteLookup.error
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Catalog Setup</h1>
        <p className="mt-1 text-sm text-muted">Manage the categories, authors and publishers used when cataloguing books.</p>
      </div>

      <div role="tablist" aria-label="Lookup type" className="flex gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] p-1">
        {TABS.map((t, i) => (
          <button
            key={t.kind}
            role="tab"
            aria-selected={activeTab === i}
            onClick={() => switchTab(i)}
            className={`rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors ${
              activeTab === i ? "bg-surface font-medium text-heading shadow-sm" : "text-muted hover:text-heading"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setModal("create")}>
          <Plus className="h-4 w-4" /> Add {tab.label.slice(0, -1)}
        </Button>
      </div>

      {deleteLookup.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(deleteLookup.error, "We couldn't delete this item.")}
        </p>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load this list.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && (data?.data.length ?? 0) === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted">No {tab.label.toLowerCase()} yet. Add the first one above.</p>
        )}

        {!isLoading && !isError && (data?.data.length ?? 0) > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {data!.data.map((record) => (
              <li key={record._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-heading">{record.name}</p>
                  {tab.extra.map((f) =>
                    record[f] ? (
                      <p key={f} className="truncate text-xs text-muted">
                        {record[f]}
                      </p>
                    ) : null
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={record.status} />
                  <button onClick={() => setModal(record)} aria-label={`Edit ${record.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-heading">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(record)} aria-label={`Delete ${record.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={modal !== null} title={modal === "create" ? `Add ${tab.label.slice(0, -1)}` : `Edit ${tab.label.slice(0, -1)}`} onClose={() => setModal(null)}>
        <LookupForm kind={tab.kind} extraFields={tab.extra} record={modal === "create" ? null : modal} onDone={() => setModal(null)} />
      </Modal>

      <Modal open={confirmDelete !== null} title={`Delete ${confirmDelete?.name ?? ""}?`} onClose={() => setConfirmDelete(null)}>
        <p className="text-sm text-muted">
          This can&apos;t be undone. It&apos;s blocked automatically if any book is still using it.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleteLookup.isPending} onClick={() => confirmDelete && handleDelete(confirmDelete)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
