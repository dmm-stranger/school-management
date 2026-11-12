"use client";

import { AUDIENCE_TYPES, type AudienceType } from "./notification.types";
import { useClasses, useSections } from "@/features/academic-structure/academicStructure.queries";
import { Select } from "@/components/ui/Select";

export interface AudienceValue {
  audienceType: AudienceType;
  classId: string;
  sectionId: string;
}

interface AudiencePickerProps {
  value: AudienceValue;
  onChange: (value: AudienceValue) => void;
}

/** Who receives a notification. Class/section narrowing is offered for students only — the backend ignores it for other audiences. */
export function AudiencePicker({ value, onChange }: AudiencePickerProps) {
  const { data: classes } = useClasses();
  const { data: sections } = useSections(value.classId || undefined);

  return (
    <fieldset className="flex flex-col gap-4 rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
      <legend className="px-1 text-sm font-medium text-heading">Audience</legend>
      <Select
        label="Send to"
        value={value.audienceType}
        onChange={(e) => onChange({ audienceType: e.target.value as AudienceType, classId: "", sectionId: "" })}
        options={AUDIENCE_TYPES}
      />
      {value.audienceType === "STUDENTS" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Class (optional)"
            placeholder="All classes"
            value={value.classId}
            onChange={(e) => onChange({ ...value, classId: e.target.value, sectionId: "" })}
            options={(classes ?? []).map((c) => ({ value: c._id, label: c.name }))}
          />
          <Select
            label="Section (optional)"
            placeholder={value.classId ? "All sections" : "Choose a class first"}
            value={value.sectionId}
            onChange={(e) => onChange({ ...value, sectionId: e.target.value })}
            options={(value.classId ? (sections ?? []) : []).map((s) => ({ value: s._id, label: s.name }))}
          />
        </div>
      )}
      <p className="text-xs text-muted">Only active accounts receive notifications.</p>
    </fieldset>
  );
}

/** Turns the picker value into the API's audience object (class/section only apply to students). */
export const toAudience = (v: AudienceValue) => ({
  type: v.audienceType,
  classId: v.audienceType === "STUDENTS" && v.classId ? v.classId : undefined,
  sectionId: v.audienceType === "STUDENTS" && v.sectionId ? v.sectionId : undefined,
});
