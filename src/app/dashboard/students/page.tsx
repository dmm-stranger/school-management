import Link from "next/link";
import Image from "next/image";
import { SAMPLE_STUDENT } from "@/config/demo-data";

export default function StudentsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-heading mb-1">
        Students
      </h1>
      <p className="text-sm text-muted mb-6">
        Full student list & search is a later step — for now, here&apos;s a
        sample profile to preview the design.
      </p>

      <Link
        href={`/dashboard/students/${SAMPLE_STUDENT.id}`}
        className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 shadow-sm hover:border-primary transition-colors max-w-sm"
      >
        <Image
          src={SAMPLE_STUDENT.avatar.url}
          alt={SAMPLE_STUDENT.avatar.alt}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full"
        />
        <div>
          <p className="font-medium text-heading">{SAMPLE_STUDENT.name}</p>
          <p className="text-sm text-muted">
            {SAMPLE_STUDENT.className} · Roll No: {SAMPLE_STUDENT.rollNo}
          </p>
        </div>
      </Link>
    </div>
  );
}
