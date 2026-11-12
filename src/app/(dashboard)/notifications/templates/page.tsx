"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Send, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useSendFromTemplate,
} from "@/features/notification/notification.queries";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  typeLabel,
  type NotificationChannel,
  type NotificationTemplate,
  type NotificationType,
} from "@/features/notification/notification.types";
import { AudiencePicker, toAudience, type AudienceValue } from "@/features/notification/AudiencePicker";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { messageFrom, fieldErrorsFrom } from "@/lib/form-errors";

// One-time-code templates are used by the sign-in/reset flow itself; editing them here is allowed
// (to change the wording) but the backend falls back to its default if {{otp}} is removed.
const OTP_TYPES: NotificationType[] = ["PASSWORD_RESET", "ACCOUNT_VERIFICATION"];

/** Unique {{token}} names found in a template, in order of first appearance. */
const extractTokens = (...texts: string[]): string[] => {
  const found = new Set<string>();
  for (const text of texts) for (const m of text.matchAll(/{{\s*(\w+)\s*}}/g)) found.add(m[1]);
  return [...found];
};

function TemplateForm({ template, onDone }: { template: NotificationTemplate | null; onDone: () => void }) {
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const [form, setForm] = useState({
    name: template?.name ?? "",
    type: (template?.type ?? "GENERAL") as NotificationType,
    title: template?.title ?? "",
    message: template?.message ?? "",
  });
  const [channels, setChannels] = useState<NotificationChannel[]>(template?.defaultChannels ?? ["IN_APP"]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;
  const apiError = create.error || update.error;

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggle = (c: NotificationChannel) => setChannels((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Template name is required.";
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.message.trim()) errs.message = "Message is required.";
    if (channels.length === 0) errs.defaultChannels = "Select at least one channel.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = { name: form.name.trim(), type: form.type, title: form.title.trim(), message: form.message.trim(), defaultChannels: channels };
    try {
      if (template) await update.mutateAsync({ id: template._id, payload });
      else await create.mutateAsync(payload);
      onDone();
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Template name" required value={form.name} onChange={set("name")} error={errors.name} />
      <Select label="Type" value={form.type} onChange={set("type")} options={NOTIFICATION_TYPES.map((t) => ({ value: t, label: typeLabel(t) }))} />
      <Input label="Title" required value={form.title} onChange={set("title")} error={errors.title} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tpl-message" className="text-sm font-medium text-heading">
          Message<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
        </label>
        <textarea
          id="tpl-message"
          rows={4}
          value={form.message}
          onChange={set("message")}
          aria-invalid={!!errors.message}
          aria-describedby="tpl-message-hint"
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
        <p id="tpl-message-hint" className="text-xs text-muted">
          Use {"{{name}}"}-style placeholders, e.g. {"{{studentName}}"} or {"{{amount}}"}. You&apos;ll fill them in when you send.
        </p>
        {errors.message && (
          <p role="alert" className="text-xs text-danger">
            {errors.message}
          </p>
        )}
      </div>
      {OTP_TYPES.includes(form.type) && (
        <p role="note" className="rounded-[var(--radius-control)] bg-[var(--color-status-pending-bg)] px-3 py-2 text-xs text-[var(--color-status-pending-text)]">
          This type carries a one-time code. Keep {"{{otp}}"} in the message — without it the system falls back to its built-in wording. It is always sent by email only.
        </p>
      )}
      <fieldset>
        <legend className="text-sm font-medium text-heading">Default channels</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {NOTIFICATION_CHANNELS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm text-heading">
              <input type="checkbox" checked={channels.includes(c.value)} onChange={() => toggle(c.value)} />
              {c.label}
            </label>
          ))}
        </div>
        {errors.defaultChannels && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {errors.defaultChannels}
          </p>
        )}
      </fieldset>
      {apiError && Object.keys(errors).length === 0 && (
        <p role="alert" className="text-sm text-danger">
          {messageFrom(apiError, "That didn't save. Please try again.")}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={pending}>
          {template ? "Save Changes" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}

function SendModal({ template, onClose }: { template: NotificationTemplate | null; onClose: () => void }) {
  const send = useSendFromTemplate();
  const [audience, setAudience] = useState<AudienceValue>({ audienceType: "STUDENTS", classId: "", sectionId: "" });
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);

  if (!template) return null;
  const tokenNames = extractTokens(template.title, template.message);

  const close = () => {
    send.reset();
    setDone(null);
    setTokens({});
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const filled = Object.fromEntries(Object.entries(tokens).filter(([, v]) => v.trim() !== ""));
      const sent = await send.mutateAsync({ id: template._id, payload: { audience: toAudience(audience), tokens: filled } });
      setDone(`Sent to ${sent.recipientCount} recipient(s).`);
    } catch {
      // shown below via send.error
    }
  };

  return (
    <Modal open title={`Send “${template.name}”`} onClose={close}>
      {done ? (
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm text-[var(--color-status-active-text)]">
            <CheckCircle2 className="h-4 w-4" /> {done}
          </p>
          <div className="flex justify-end">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <AudiencePicker value={audience} onChange={setAudience} />
          {tokenNames.length > 0 && (
            <fieldset className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-medium text-heading">Fill in the placeholders</legend>
              {tokenNames.map((name) => (
                <Input key={name} label={name} value={tokens[name] ?? ""} onChange={(e) => setTokens((t) => ({ ...t, [name]: e.target.value }))} />
              ))}
              <p className="text-xs text-muted">The same values go to every recipient. Anything left blank stays as {"{{placeholder}}"} in the message.</p>
            </fieldset>
          )}
          {send.isError && (
            <p role="alert" className="text-sm text-danger">
              {messageFrom(send.error, "We couldn't send this notification.")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={send.isPending}>
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function TemplatesPage() {
  const { can } = usePermission();
  const { data, isLoading, isError, error, refetch } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const [modal, setModal] = useState<"create" | NotificationTemplate | null>(null);
  const [sending, setSending] = useState<NotificationTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<NotificationTemplate | null>(null);

  const templates = data?.data ?? [];

  if (!can("notification:list")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <FileText className="h-8 w-8 text-muted" />
        <p className="text-sm text-muted">Templates are managed by administrators.</p>
        <Link href="/notifications">
          <Button>Go to my notifications</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async (t: NotificationTemplate) => {
    try {
      await deleteTemplate.mutateAsync(t._id);
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null); // the error banner below stays visible
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <Link href="/notifications/manage" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to log
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Notification Templates</h1>
        <p className="mt-1 text-sm text-muted">Reusable wording. An active template of a matching type is also used for that type&apos;s automatic notifications.</p>
      </div>

      {can("notification:create") && (
        <div className="flex justify-end">
          <Button onClick={() => setModal("create")}>
            <Plus className="h-4 w-4" /> New Template
          </Button>
        </div>
      )}

      {deleteTemplate.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(deleteTemplate.error, "We couldn't delete this template.")}
        </p>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load templates.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && templates.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <FileText className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No templates yet</p>
            <p className="text-sm text-muted">Create one to reuse wording for announcements and automatic notifications.</p>
          </div>
        )}
        {!isLoading && !isError && templates.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {templates.map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-heading">{t.name}</p>
                  <p className="truncate text-xs text-muted">
                    {typeLabel(t.type)} · {t.defaultChannels.map((c) => NOTIFICATION_CHANNELS.find((x) => x.value === c)?.label).join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge status={t.status} />
                  {can("notification:create") && t.status === "ACTIVE" && (
                    <Button variant="secondary" onClick={() => setSending(t)}>
                      <Send className="h-4 w-4" /> Send
                    </Button>
                  )}
                  {can("notification:update") && (
                    <button onClick={() => setModal(t)} aria-label={`Edit ${t.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-heading">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {can("notification:delete") && (
                    <button onClick={() => setConfirmDelete(t)} aria-label={`Delete ${t.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={modal !== null} title={modal === "create" ? "New Template" : "Edit Template"} onClose={() => setModal(null)}>
        <TemplateForm template={modal === "create" ? null : modal} onDone={() => setModal(null)} />
      </Modal>

      <SendModal template={sending} onClose={() => setSending(null)} />

      <Modal open={confirmDelete !== null} title={`Delete ${confirmDelete?.name ?? ""}?`} onClose={() => setConfirmDelete(null)}>
        <p className="text-sm text-muted">Notifications already sent from it are not affected — they keep the text they were sent with.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleteTemplate.isPending} onClick={() => confirmDelete && void handleDelete(confirmDelete)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
