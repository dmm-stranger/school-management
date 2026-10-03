"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, AlertCircle, Plus, Pencil } from "lucide-react";
import { useBook, useAddCopies, useUpdateCopy, useUpdateBook, useDeleteBook } from "@/features/library/library.queries";
import { MANUAL_COPY_STATUSES, type CopyStatus, type NamedRef } from "@/features/library/library.types";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fieldErrorsFrom, messageFrom } from "@/lib/form-errors";
import { formatMoney } from "@/lib/format";

const nameOf = (ref: NamedRef | string | null | undefined) => (ref && typeof ref !== "string" ? ref.name : "—");

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = usePermission();
  const isManager = can("library:create");

  const { data: book, isLoading, isError, error, refetch } = useBook(id);
  const addCopies = useAddCopies();
  const updateCopy = useUpdateCopy();
  const updateBook = useUpdateBook(id);
  const deleteBook = useDeleteBook();

  const [copyCount, setCopyCount] = useState("1");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [edit, setEdit] = useState({ title: "", subtitle: "", shelfLocation: "", price: "", description: "" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const startEdit = () => {
    if (!book) return;
    setEdit({
      title: book.title,
      subtitle: book.subtitle ?? "",
      shelfLocation: book.shelfLocation ?? "",
      price: book.price != null ? String(book.price) : "",
      description: book.description ?? "",
    });
    setEditErrors({});
    setEditing(true);
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!edit.title.trim()) {
      setEditErrors({ title: "Title is required." });
      return;
    }
    try {
      await updateBook.mutateAsync({
        title: edit.title.trim(),
        subtitle: edit.subtitle.trim() || undefined,
        shelfLocation: edit.shelfLocation.trim() || undefined,
        price: edit.price ? Number(edit.price) : undefined,
        description: edit.description.trim() || undefined,
      });
      setEditing(false);
    } catch (err) {
      setEditErrors(fieldErrorsFrom(err));
    }
  };

  const handleAddCopies = async (e: FormEvent) => {
    e.preventDefault();
    const count = Number(copyCount);
    if (!Number.isInteger(count) || count < 1 || count > 100) return;
    try {
      await addCopies.mutateAsync({ bookId: id, count });
      setCopyCount("1");
    } catch {
      // surfaced below via addCopies.error
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBook.mutateAsync(id);
      router.push("/library");
    } catch {
      setConfirmDelete(false); // error is shown in the banner
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--color-surface-alt)]" />
        <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-heading">Couldn&apos;t load this book</p>
        <p className="text-sm text-muted">{messageFrom(error, "It may have been removed.")}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/library">
            <Button variant="ghost">Back to catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const mutationError = updateCopy.error || addCopies.error || deleteBook.error || updateBook.error;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-heading">{book.title}</h1>
            {book.subtitle && <p className="text-sm text-muted">{book.subtitle}</p>}
          </div>
          {isManager && !editing && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={startEdit}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="secondary"
                isLoading={updateBook.isPending}
                onClick={() => updateBook.mutate({ status: book.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
              >
                {book.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {mutationError && (
        <div role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(mutationError, "That didn't work. Please try again.")}
        </div>
      )}

      {editing ? (
        <form
          onSubmit={saveEdit}
          noValidate
          className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6 sm:grid-cols-2"
        >
          <Input label="Title" required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} error={editErrors.title} />
          <Input label="Subtitle" value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} />
          <Input label="Shelf location" value={edit.shelfLocation} onChange={(e) => setEdit({ ...edit, shelfLocation: e.target.value })} />
          <Input label="Price" type="number" min={0} value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} error={editErrors.price} />
          <div className="sm:col-span-2">
            <Input label="Description" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateBook.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6 text-sm sm:grid-cols-2">
          {[
            ["Authors", book.authorIds.map((a) => a.name).join(", ") || "—"],
            ["Category", nameOf(book.categoryId)],
            ["Publisher", nameOf(book.publisherId)],
            ["ISBN", book.isbn || "—"],
            ["Edition", book.edition || "—"],
            ["Published", book.publishedYear ? String(book.publishedYear) : "—"],
            ["Language", book.language || "—"],
            ["Shelf", book.shelfLocation || "—"],
            ...(isManager ? [["Price", book.price != null ? formatMoney(book.price) : "—"]] : []),
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
              <dd className="mt-0.5 text-heading">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Availability</dt>
            <dd className="mt-0.5 font-medium text-heading">
              {book.copies.available} of {book.copies.total} copies available
              {book.status === "INACTIVE" && <span className="ml-2"><StatusBadge status="INACTIVE" /></span>}
            </dd>
          </div>
          {book.description && (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-muted">Description</dt>
              <dd className="mt-0.5 text-heading">{book.description}</dd>
            </div>
          )}
        </div>
      )}

      {isManager && (
        <section aria-labelledby="copies-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
            <h2 id="copies-heading" className="text-base font-semibold text-heading">
              Copies ({book.copyList.filter((c) => c.status !== "RETIRED").length})
            </h2>
            <form onSubmit={handleAddCopies} className="flex items-end gap-2">
              <div className="w-24">
                <Input label="Add copies" type="number" min={1} max={100} value={copyCount} onChange={(e) => setCopyCount(e.target.value)} />
              </div>
              <Button type="submit" isLoading={addCopies.isPending} className="mb-px">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>
          </div>

          {book.copyList.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No copies yet. Add copies above to make this book lendable.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Barcode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Change status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {book.copyList.map((c) => (
                    <tr key={c._id}>
                      <td className="px-4 py-3 font-mono text-heading">{c.barcode}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "ISSUED" ? (
                          <span className="text-xs text-muted">Return it first</span>
                        ) : (
                          <>
                            <label htmlFor={`status-${c._id}`} className="sr-only">
                              Status for {c.barcode}
                            </label>
                            <select
                              id={`status-${c._id}`}
                              value={c.status}
                              disabled={updateCopy.isPending}
                              onChange={(e) => updateCopy.mutate({ id: c._id, status: e.target.value as CopyStatus })}
                              className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-2 py-1.5 text-sm"
                            >
                              {MANUAL_COPY_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0) + s.slice(1).toLowerCase()}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {can("library:delete") && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
          <p className="text-sm text-muted">Deleting removes this book from the catalog. Past loans stay in the history.</p>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-heading">Delete this book and all its copies?</span>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Keep
              </Button>
              <Button variant="danger" isLoading={deleteBook.isPending} onClick={handleDelete}>
                Delete Book
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4 text-danger" /> Delete Book
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
