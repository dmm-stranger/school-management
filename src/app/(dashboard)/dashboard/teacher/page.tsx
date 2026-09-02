"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { GraduationCap, ClipboardCheck, FileText, Calendar } from "lucide-react";

export default function TeacherDashboardPage() {
  return (
    <RoleDashboard
      title="Teaching Overview"
      description="Your classes at a glance"
      kpis={[
        { label: "My Students", value: "—", icon: GraduationCap, color: "students" },
        { label: "Classes Today", value: "—", icon: Calendar, color: "events" },
        { label: "Attendance Pending", value: "—", icon: ClipboardCheck, color: "attendance" },
        { label: "Marks to Enter", value: "—", icon: FileText, color: "fees" },
      ]}
    />
  );
}
