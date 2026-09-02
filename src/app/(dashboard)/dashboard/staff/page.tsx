"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { Calendar, Bell, ClipboardCheck, Users } from "lucide-react";

export default function StaffDashboardPage() {
  return (
    <RoleDashboard
      title="Staff Overview"
      description="Your daily tasks and schedule"
      kpis={[
        { label: "Today's Schedule", value: "—", icon: Calendar, color: "events" },
        { label: "Notifications", value: "—", icon: Bell, color: "fees" },
        { label: "Attendance", value: "—", icon: ClipboardCheck, color: "attendance" },
        { label: "Colleagues", value: "—", icon: Users, color: "teachers" },
      ]}
    />
  );
}
