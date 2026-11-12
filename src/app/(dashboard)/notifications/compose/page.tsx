"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useCompose, useTemplates } from "@/features/notification/notification.queries";
import {
  AUDIENCE_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  PRIORITIES,
  typeLabel,
  type NotificationChannel,
  type NotificationType,
  type Priority,
} from "@/features/notification/notification.types";
import { useClasses, useSections } from "@/features/academic-structure/academicStructure.queries";
import { AudiencePicker, toAudience, type AudienceValue } from "@/features/notification/AudiencePicker";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { messageFrom } from "@/lib/form-errors";

// One-time-code notifications are system-only (sent automatically by the auth flow); a person
// composing by hand should never be offered them.
const COMPOSABLE_TYPES = NOTIFICATION_TYPES.filter((t) => t !== "PASSWORD_RESET" && t !== "ACCOUNT_VERIFICATION");

export default function ComposeNotificationPage() {
  const { can } = usePermission();
  const compose = useCompose();
  const canUseTemplates = can("notification:list");
  const { data: templates } = useTemplates({ status: "ACTIVE" }, { enabled: canUseTemplates });

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "GENERAL" as NotificationType,
    priority: "NORMAL" as Priority,
  });
  const [audience, setAudience] = useState<AudienceValue>({ audienceType: "STUDENTS", classId: "", sectionId: "" });
  const [channels, setChannels] = useState<NotificationChannel[]>(["IN_APP"]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Needed only to turn the chosen ids into readable names for the confirmation dialog.
  const { data: classes } = useClasses();
  const { data: sections } = useSections(audience.classId || undefined);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleChannel = (c: NotificationChannel) => setChannels((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const applyTemplate = (id: string) => {
    const t = templates?.data.find((x) => x._id === id);
    if (!t) return;
    setForm((f) => ({ ...f, title: t.title, message: t.message, type: t.type }));
    setChannels(t.defaultChannels);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.message.trim()) errs.message = "Message is required.";
    if (channels.length === 0) errs.channels = "Select at least one channel.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const audienceLabel = () => {
    const base = AUDIENCE_TYPES.find((a) => a.value === audience.audienceType)?.label ?? audience.audienceType;
    if (audience.audienceType !== "STUDENTS" || !audience.classId) return base;
    const cls = classes?.find((c) => c._id === audience.classId)?.name ?? "selected class";
    const sec = sections?.find((s) => s._id === audience.sectionId)?.name;
    return `${base} of ${cls}${sec ? ` — section ${sec}` : ""}`;
  };

  const submit = async (saveAsDraft: boolean) => {
    setResult(null);
    try {
      const sent = await compose.mutateAsync({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        priority: form.priority,
        channels,
        audience: toAudience(audience),
        saveAsDraft,
      });
      setConfirming(false);
      setResult(saveAsDraft ? `Saved as a draft for ${sent.recipientCount} recipient(s).` : `Sent to ${sent.recipientCount} recipient(s).`);
      setForm((f) => ({ ...f, title: "", message: "" }));
    } catch {
      setConfirming(false); // the error banner below explains what happened
    }
  };

  const onSendClick = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) setConfirming(true);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link href="/notifications" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to notifications
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Send Notification</h1>
        <p className="mt-1 text-sm text-muted">Compose a message, pick who gets it and how.</p>
      </div>

      {result && (
        <p role="status" className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-active-bg)] px-4 py-3 text-sm text-[var(--color-status-active-text)]">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {result}{" "}
          {can("notification:list") && (
            <Link href="/notifications/manage" className="font-medium underline">
              View log
            </Link>
          )}
        </p>
      )}

      {compose.isError && (
        <p role="alert" className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {messageFrom(compose.error, "We couldn't send this notification. Please try again.")}
        </p>
      )}

      <form onSubmit={onSendClick} noValidate className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        {canUseTemplates && (templates?.data.length ?? 0) > 0 && (
          <Select
            label="Start from a template (optional)"
            placeholder="No template"
            value=""
            onChange={(e) => applyTemplate(e.target.value)}
            options={templates!.data.map((t) => ({ value: t._id, label: `${t.name} (${typeLabel(t.type)})` }))}
          />
        )}

        <Input label="Title" required value={form.title} onChange={set("title")} error={errors.title} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notif-message" className="text-sm font-medium text-heading">
            Message<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
          </label>
          <textarea
            id="notif-message"
            rows={4}
            value={form.message}
            onChange={set("message")}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "notif-message-error" : undefined}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
          {errors.message && (
            <p id="notif-message-error" role="alert" className="text-xs text-danger">
              {errors.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Type" value={form.type} onChange={set("type")} options={COMPOSABLE_TYPES.map((t) => ({ value: t, label: typeLabel(t) }))} />
          <Select label="Priority" value={form.priority} onChange={set("priority")} options={PRIORITIES.map((p) => ({ value: p, label: p.charAt(0) + p.slice(1).toLowerCase() }))} />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-heading">
            Channels<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {NOTIFICATION_CHANNELS.map((c) => (
              <label key={c.value} className="flex items-center gap-2 text-sm text-heading">
                <input type="checkbox" checked={channels.includes(c.value)} onChange={() => toggleChannel(c.value)} />
                {c.label}
              </label>
            ))}
          </div>
          {errors.channels && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {errors.channels}
            </p>
          )}
        </fieldset>

        <AudiencePicker value={audience} onChange={setAudience} />

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            isLoading={compose.isPending && !confirming}
            onClick={() => {
              if (validate()) void submit(true);
            }}
          >
            <Save className="h-4 w-4" /> Save as draft
          </Button>
          <Button type="submit">
            <Send className="h-4 w-4" /> Send now
          </Button>
        </div>
      </form>

      <Modal open={confirming} title="Send this notification?" onClose={() => setConfirming(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <p className="font-medium text-heading">{form.title}</p>
            <p className="mt-1 text-muted">{form.message}</p>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted">To</dt>
            <dd className="text-heading">{audienceLabel()}</dd>
            <dt className="text-muted">Via</dt>
            <dd className="text-heading">{channels.map((c) => NOTIFICATION_CHANNELS.find((x) => x.value === c)?.label).join(", ")}</dd>
          </dl>
          <p className="text-muted">A sent notification can&apos;t be recalled.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Go back
            </Button>
            <Button isLoading={compose.isPending} onClick={() => void submit(false)}>
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
