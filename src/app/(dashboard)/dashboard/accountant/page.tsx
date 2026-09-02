"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { Wallet, FileText, GraduationCap, Users } from "lucide-react";

export default function AccountantDashboardPage() {
  return (
    <RoleDashboard
      title="Finance Overview"
      description="School financial summary"
      kpis={[
        { label: "Collected Today", value: "—", icon: Wallet, color: "fees" },
        { label: "Pending Invoices", value: "—", icon: FileText, color: "events" },
        { label: "Students with Dues", value: "—", icon: GraduationCap, color: "students" },
        { label: "Salaries Due", value: "—", icon: Users, color: "teachers" },
      ]}
    />
  );
}
