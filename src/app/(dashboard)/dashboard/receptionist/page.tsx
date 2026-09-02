"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { Users, GraduationCap, Bell, Calendar } from "lucide-react";

export default function ReceptionistDashboardPage() {
  return (
    <RoleDashboard
      title="Reception Overview"
      description="Visitors and front-desk summary"
      kpis={[
        { label: "Guardians Today", value: "—", icon: Users, color: "teachers" },
        { label: "New Admissions", value: "—", icon: GraduationCap, color: "students" },
        { label: "Notifications Sent", value: "—", icon: Bell, color: "fees" },
        { label: "Appointments", value: "—", icon: Calendar, color: "events" },
      ]}
    />
  );
}
