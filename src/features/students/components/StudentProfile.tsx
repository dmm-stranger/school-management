"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { DonutChart } from "@/components/ui/DonutChart";
import { SAMPLE_STUDENT, STUDENT_TABS } from "@/config/demo-data";
import { TONE_HEX } from "@/lib/utils/tone";

export function StudentProfile() {
  const [activeTab, setActiveTab] = useState<string>(STUDENT_TABS[0]);
  const student = SAMPLE_STUDENT;
  const attendanceData = [
    { name: "Present", value: student.attendanceThisMonth.present, color: TONE_HEX.success },
    { name: "Absent", value: student.attendanceThisMonth.absent, color: TONE_HEX.danger },
    { name: "Leave", value: student.attendanceThisMonth.leave, color: TONE_HEX.warning },
  ];
  const totalDays =
    student.attendanceThisMonth.present +
    student.attendanceThisMonth.absent +
    student.attendanceThisMonth.leave;
  const presentPct = totalDays
    ? Math.round((student.attendanceThisMonth.present / totalDays) * 100)
    : 0;

  return (
    <div className="max-w-6xl">
      <nav className="flex items-center gap-1.5 text-sm text-muted mb-4">
        <Link href="/dashboard/students" className="hover:text-primary">
          Students
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-heading">Student Profile</span>
      </nav>

      <div className="rounded-card border border-border bg-surface p-5 shadow-sm flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Image
            src={student.avatar.url}
            alt={student.avatar.alt}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
          />
          <div>
            <h1 className="font-display text-xl font-semibold text-heading">
              {student.name}
            </h1>
            <p className="text-sm text-muted">
              {student.className} · Roll No: {student.rollNo}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Mail size={12} aria-hidden="true" /> {student.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} aria-hidden="true" /> {student.phone}
              </span>
            </div>
          </div>
        </div>
        <span className="rounded-pill bg-status-active-bg text-status-active-text text-xs font-medium px-3 py-1">
          + Active
        </span>
      </div>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {STUDENT_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-heading"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <InfoPanel
            title="Personal Information"
            rows={[
              ["Date of Birth", student.personal.dateOfBirth],
              ["Gender", student.personal.gender],
              ["Address", student.personal.address],
              ["Parent Name", student.personal.parentName],
              ["Contact", student.personal.contact],
            ]}
          />
          <InfoPanel
            title="Academic Information"
            rows={[
              ["Class", student.academic.className],
              ["Section", student.academic.section],
              ["Admission No.", student.academic.admissionNo],
              ["Admission Date", student.academic.admissionDate],
              ["RTE", student.academic.rte],
            ]}
          />
          <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
            <h3 className="font-display font-semibold text-heading mb-3">
              Attendance This Month
            </h3>
            <DonutChart
              data={attendanceData}
              centerValue={`${presentPct}%`}
              centerLabel="Present"
              size={128}
            />
            <Link
              href="#"
              className="mt-4 block text-center text-sm font-medium text-primary hover:text-primary-hover rounded-control border border-border py-2"
            >
              View Full Attendance
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-surface p-10 text-center text-muted shadow-sm">
          {activeTab} content isn&apos;t built yet — this tab is a placeholder
          until that module is wired up.
        </div>
      )}
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
      <h3 className="font-display font-semibold text-heading mb-3">{title}</h3>
      <dl className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="text-heading font-medium text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
