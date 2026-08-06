import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardCheck,
  School,
  Users,
  UserRound,
  GraduationCap,
  Megaphone,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Default nav set, based on the modules mapped out in the build plan.
 * Roles aren't defined yet (see docs/STEP-1-SETUP.md open questions) —
 * once they are, this list will likely need to be filtered per role
 * rather than shown in full to everyone.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck },
  { label: "Classes", href: "/dashboard/classes", icon: School },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Teachers", href: "/dashboard/teachers", icon: UserRound },
  { label: "Results", href: "/dashboard/results", icon: GraduationCap },
  { label: "Notices", href: "/dashboard/notices", icon: Megaphone },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
