"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { GraduationCap, ClipboardCheck, Wallet, FileText } from "lucide-react";

export default function GuardianDashboardPage() {
  return (
    <RoleDashboard
      title="Child Overview"
      description="Your children's academic progress"
      kpis={[
        { label: "Children", value: "—", icon: GraduationCap, color: "students" },
        { label: "Attendance", value: "—", icon: ClipboardCheck, color: "attendance" },
        { label: "Fees Due", value: "—", icon: Wallet, color: "fees" },
        { label: "Latest Result", value: "—", icon: FileText, color: "events" },
      ]}
    />
  );
}
