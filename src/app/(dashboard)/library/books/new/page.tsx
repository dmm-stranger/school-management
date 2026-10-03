"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateBook, useLookups } from "@/features/library/library.queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { fieldErrorsFrom, messageFrom } from "@/lib/form-errors";

export default function NewBookPage() {
  const router = useRouter();
  const createBook = useCreateBook();
  const { data: categories } = useLookups("book-categories");
  const { data: authors } = useLookups("authors");
  const { data: publishers } = useLookups("publishers");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    isbn: "",
    categoryId: "",
    publisherId: "",
    edition: "",
    publishedYear: "",
    language: "English",
    shelfLocation: "",
    price: "",
    description: "",
    initialCopies: "1",
  });
  const [authorIds, setAuthorIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleAuthor = (id: string) =>
    setAuthorIds((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.categoryId) errs.categoryId = "Select a category.";
    if (authorIds.length === 0) errs.authorIds = "Select at least one author.";
    if (form.isbn && !/^(?:\d{9}[\dXx]|\d{13})$/.test(form.isbn.trim())) {
      errs.isbn = "ISBN must be 10 or 13 characters, digits only (no dashes).";
    }
    const copies = Number(form.initialCopies);
    if (!Number.isInteger(copies) || copies < 0 || copies > 100) errs.initialCopies = "Enter a whole number from 0 to 100.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const book = await createBook.mutateAsync({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        isbn: form.isbn.trim() || undefined,
        categoryId: form.categoryId,
        authorIds,
        publisherId: form.publisherId || undefined,
        edition: form.edition.trim() || undefined,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
        language: form.language.trim() || undefined,
        shelfLocation: form.shelfLocation.trim() || undefined,
        price: form.price ? Number(form.price) : undefined,
        description: form.description.trim() || undefined,
        initialCopies: copies,
      });
      router.push(`/library/books/${book._id}`);
    } catch (err) {
      setErrors(fieldErrorsFrom(err)); // server-side field errors land on their inputs
    }
  };

  const noLookups = categories && authors && (categories.data.length === 0 || authors.data.length === 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Add Book</h1>
        <p className="mt-1 text-sm text-muted">Each copy you add gets its own barcode for issuing and returning.</p>
      </div>

      {noLookups && (
        <div role="status" className="rounded-[var(--radius-control)] bg-[var(--color-status-pending-bg)] px-4 py-3 text-sm text-[var(--color-status-pending-text)]">
          You need at least one category and one author first.{" "}
          <Link href="/library/setup" className="font-medium underline">
            Set them up
          </Link>
          .
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6"
      >
        {createBook.isError && Object.keys(errors).length === 0 && (
          <div role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
            {messageFrom(createBook.error, "We couldn't save this book. Check your connection and try again.")}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Title" required value={form.title} onChange={set("title")} error={errors.title} />
          </div>
          <Input label="Subtitle" value={form.subtitle} onChange={set("subtitle")} />
          <Input label="ISBN" value={form.isbn} onChange={set("isbn")} error={errors.isbn} hint="10 or 13 digits, no dashes" />
          <Select
            label="Category"
            required
            placeholder="Select category"
            value={form.categoryId}
            onChange={set("categoryId")}
            error={errors.categoryId}
            options={(categories?.data ?? []).filter((c) => c.status === "ACTIVE").map((c) => ({ value: c._id, label: c.name }))}
          />
          <Select
            label="Publisher"
            placeholder="Select publisher (optional)"
            value={form.publisherId}
            onChange={set("publisherId")}
            error={errors.publisherId}
            options={(publishers?.data ?? []).filter((p) => p.status === "ACTIVE").map((p) => ({ value: p._id, label: p.name }))}
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-heading">
            Authors<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(authors?.data ?? []).filter((a) => a.status === "ACTIVE").map((a) => {
              const on = authorIds.includes(a._id);
              return (
                <button
                  key={a._id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleAuthor(a._id)}
                  className={`rounded-[var(--radius-pill)] border px-3 py-1 text-sm transition-colors ${
                    on ? "border-primary bg-[var(--color-primary-light)] text-primary" : "border-[var(--color-border)] text-muted hover:text-heading"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {a.name}
                </button>
              );
            })}
          </div>
          {errors.authorIds && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {errors.authorIds}
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Edition" value={form.edition} onChange={set("edition")} />
          <Input label="Published year" type="number" value={form.publishedYear} onChange={set("publishedYear")} error={errors.publishedYear} />
          <Input label="Language" value={form.language} onChange={set("language")} />
          <Input label="Shelf location" value={form.shelfLocation} onChange={set("shelfLocation")} placeholder="Shelf B3" />
          <Input label="Price" type="number" min={0} value={form.price} onChange={set("price")} error={errors.price} hint="Used for the lost-book charge" />
          <Input label="Copies to add now" type="number" min={0} max={100} value={form.initialCopies} onChange={set("initialCopies")} error={errors.initialCopies} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-description" className="text-sm font-medium text-heading">
            Description
          </label>
          <textarea
            id="book-description"
            rows={3}
            value={form.description}
            onChange={set("description")}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/library">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={createBook.isPending}>
            {createBook.isPending ? "Saving…" : "Save Book"}
          </Button>
        </div>
      </form>
    </div>
  );
}
