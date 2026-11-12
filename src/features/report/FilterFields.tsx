"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useClasses, useSections } from "@/features/academic-structure/academicStructure.queries";
import { useExams } from "@/features/exam/exam.queries";
import { useRoutes } from "@/features/transport/transport.queries";
import { useHostels } from "@/features/hostel/hostel.queries";
import type { FilterDef } from "./report.types";

interface FieldProps {
  def: FilterDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const label = (def: FilterDef) => def.label;

function ClassField({ def, value, error, onChange }: FieldProps) {
  const { data } = useClasses();
  return <Select label={label(def)} required={def.required} placeholder="All classes" value={value} error={error} onChange={(e) => onChange(e.target.value)} options={(data ?? []).map((c) => ({ value: c._id, label: c.name }))} />;
}

function SectionField({ def, value, error, onChange, classId }: FieldProps & { classId: string }) {
  const { data } = useSections(classId || undefined);
  return (
    <Select
      label={label(def)}
      required={def.required}
      placeholder={classId ? "All sections" : "Choose a class first"}
      value={value}
      error={error}
      onChange={(e) => onChange(e.target.value)}
      options={(classId ? (data ?? []) : []).map((s) => ({ value: s._id, label: s.name }))}
    />
  );
}

function ExamField({ def, value, error, onChange }: FieldProps) {
  const { data } = useExams();
  return <Select label={label(def)} required={def.required} placeholder="Select exam" value={value} error={error} onChange={(e) => onChange(e.target.value)} options={(data?.data ?? []).map((x) => ({ value: x._id, label: x.examName }))} />;
}

function RouteField({ def, value, error, onChange }: FieldProps) {
  const { data } = useRoutes();
  return <Select label={label(def)} required={def.required} placeholder="All routes" value={value} error={error} onChange={(e) => onChange(e.target.value)} options={(data?.data ?? []).map((r) => ({ value: r._id, label: r.name }))} />;
}

function HostelField({ def, value, error, onChange }: FieldProps) {
  const { data } = useHostels();
  return <Select label={label(def)} required={def.required} placeholder="All hostels" value={value} error={error} onChange={(e) => onChange(e.target.value)} options={(data?.data ?? []).map((h) => ({ value: h._id, label: h.name }))} />;
}

/**
 * Renders one filter from the server's template metadata, so adding a report on the backend needs
 * no new form here. `values` is the whole form (a section filter needs the chosen class).
 */
export function FilterField({ def, values, errors, onChange }: { def: FilterDef; values: Record<string, string>; errors: Record<string, string>; onChange: (key: string, value: string) => void }) {
  const props: FieldProps = { def, value: values[def.key] ?? "", error: errors[def.key], onChange: (v) => onChange(def.key, v) };

  switch (def.kind) {
    case "date":
      return <Input label={def.label} type="date" required={def.required} value={props.value} error={props.error} onChange={(e) => props.onChange(e.target.value)} />;
    case "select":
      return <Select label={def.label} required={def.required} placeholder="Any" value={props.value} error={props.error} onChange={(e) => props.onChange(e.target.value)} options={def.options ?? []} />;
    case "class":
      return <ClassField {...props} />;
    case "section":
      return <SectionField {...props} classId={values.classId ?? ""} />;
    case "exam":
      return <ExamField {...props} />;
    case "route":
      return <RouteField {...props} />;
    case "hostel":
      return <HostelField {...props} />;
    default:
      return null;
  }
}
