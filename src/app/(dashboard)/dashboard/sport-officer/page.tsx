"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { GraduationCap, Calendar, FileText, Users } from "lucide-react";

export default function SportOfficerDashboardPage() {
  return (
    <RoleDashboard
      title="Sports Overview"
      description="Athletics and events summary"
      kpis={[
        { label: "Registered Students", value: "—", icon: GraduationCap, color: "students" },
        { label: "Upcoming Events", value: "—", icon: Calendar, color: "events" },
        { label: "Teams", value: "—", icon: Users, color: "teachers" },
        { label: "Reports", value: "—", icon: FileText, color: "fees" },
      ]}
    />
  );
}
