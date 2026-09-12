import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  FileText,
  Wallet,
  BookOpen,
  Bus,
  Building2,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  /** Permission required to see this item. Backend remains the real authority. */
  permission?: string;
  /** If set, item only shows for these roles regardless of permission (rare — prefer permission). */
  roles?: string[];
  badge?: number;
  children?: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Single source of truth for navigation — per 24-navigation-system.md §66:
 * "Do not hardcode the same navigation item independently in multiple role layouts."
 * Visibility is resolved at render time from the user's permissions.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: "",
    items: [
      { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "students", label: "Students", path: "/people/students", icon: GraduationCap, permission: "student:list" },
      { id: "teachers", label: "Teachers", path: "/people/teachers", icon: Users, permission: "teacher:list" },
      { id: "staff", label: "Staff", path: "/people/staff", icon: Users, permission: "staff:list" },
      { id: "guardians", label: "Guardians", path: "/people/guardians", icon: Users, permission: "guardian:list" },
    ],
  },
  {
    id: "academic",
    label: "Academic",
    items: [
      { id: "academic-years", label: "Academic Years", path: "/academic/years", icon: Calendar, permission: "academic:list" },
      { id: "classes", label: "Classes", path: "/academic/classes", icon: Building2, permission: "academic:list" },
      { id: "subjects", label: "Subjects", path: "/academic/subjects", icon: BookOpen, permission: "subject:list" },
      { id: "assignments", label: "Teacher Assignments", path: "/academic/assignments", icon: Users, permission: "assignment:list" },
      { id: "enrollments", label: "Student Enrollments", path: "/academic/enrollments", icon: GraduationCap, permission: "enrollment:list" },
      { id: "rooms", label: "Rooms & Buildings", path: "/academic/rooms", icon: Building2, permission: "room:list" },
      { id: "routine", label: "Routine", path: "/academic/routine", icon: Calendar, permission: "routine:list" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "attendance", label: "Attendance", path: "/attendance", icon: ClipboardCheck, permission: "attendance:list" },
      { id: "attendance-summary", label: "Attendance Summary", path: "/attendance/summary", icon: ClipboardCheck, permission: "attendance:read" },
      { id: "exams", label: "Exams", path: "/examination/exams", icon: FileText, permission: "exam:list" },
      { id: "exam-schedules", label: "Exam Schedules", path: "/examination/schedules", icon: FileText, permission: "exam:list" },
      { id: "exam-marks", label: "Marks Entry", path: "/examination/marks", icon: FileText, permission: "result:list" },
      { id: "exam-results", label: "Results", path: "/examination/results", icon: FileText, permission: "result:read" },
      { id: "finance", label: "Finance", path: "/finance", icon: Wallet, permission: "finance:list" },
      { id: "library", label: "Library", path: "/library", icon: BookOpen, permission: "library:list" },
      { id: "transport", label: "Transport", path: "/transport", icon: Bus, permission: "transport:list" },
      { id: "hostel", label: "Hostel", path: "/hostel", icon: Building2, permission: "hostel:list" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "reports", label: "Reports", path: "/reports", icon: BarChart3, permission: "report:list" },
      { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell, permission: "notification:list" },
      { id: "settings", label: "Settings", path: "/settings", icon: Settings, permission: "settings:read" },
      { id: "security", label: "Security", path: "/security", icon: ShieldCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
];

/** Role → landing dashboard path. Mirrors AuthContext.resolveDashboardPath. */
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  SUPER_ADMIN: "/dashboard/admin",
  ADMIN: "/dashboard/admin",
  PRINCIPAL: "/dashboard/principal",
  VICE_PRINCIPAL: "/dashboard/principal",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  GUARDIAN: "/dashboard/guardian",
  ACCOUNTANT: "/dashboard/accountant",
  STAFF: "/dashboard/staff",
  LIBRARIAN: "/dashboard/librarian",
  RECEPTIONIST: "/dashboard/receptionist",
  SPORT_OFFICER: "/dashboard/sport-officer",
};
