/**
 * ============================================================================
 * DEMO DATA STORE — one file for every sample/mock value and every
 * image, avatar, and SVG/logo reference used across the project.
 * ============================================================================
 *
 * Why one file: swapping in real data (from your backend) or real assets
 * (real photos, real logo) should mean editing values in THIS file, not
 * hunting through components. Nothing in here should be duplicated
 * elsewhere — if a component needs a mock value or an image, it imports
 * it from here.
 *
 * Sections in this file:
 *   1. MEDIA — images, avatars, logo/SVG paths
 *   2. CLASS LEVELS — static Class 1–10 reference list
 *   3. ATTENDANCE (ledger) — per-class attendance rows
 *   4. DASHBOARD — stats, attendance trend, activities, events, fees
 *   5. STUDENT PROFILE — one sample student record
 *
 * Everything under MEDIA that points at picsum.photos / ui-avatars.com is a
 * free placeholder-image service, not stock photography — swap for real
 * files under /public whenever you have them (see docs/STEP-4-MEDIA-STORE.md
 * and docs/STEP-5-DEDUPLICATION.md for exact swap-in steps).
 */

// ---------------------------------------------------------------------------
// 1. MEDIA
// ---------------------------------------------------------------------------

export type DemoImage = { url: string; alt: string; width: number; height: number };

/** Site brand mark. Real file at /public/brand/logo.svg — edit that file directly to change it. */
export const LOGO_SVG_PATH = "/brand/logo.svg";

export const HERO_IMAGE: DemoImage = {
  url: "https://picsum.photos/seed/eduvision-campus/1200/900",
  alt: "EduVision School campus building",
  width: 1200,
  height: 900,
};

export const CAMPUS_GALLERY: (DemoImage & { key: string; label: string })[] = [
  {
    key: "science-lab",
    label: "Science Lab",
    url: "https://picsum.photos/seed/eduvision-science/800/600",
    alt: "Students working in the science lab",
    width: 800,
    height: 600,
  },
  {
    key: "sports",
    label: "Sports & Athletics",
    url: "https://picsum.photos/seed/eduvision-sports/800/600",
    alt: "Students playing sports on the school field",
    width: 800,
    height: 600,
  },
  {
    key: "library",
    label: "Library",
    url: "https://picsum.photos/seed/eduvision-library/800/600",
    alt: "Students reading in the school library",
    width: 800,
    height: 600,
  },
];

export const TRUST_AVATARS: DemoImage[] = ["A", "B", "C", "D"].map((letter) => ({
  url: `https://ui-avatars.com/api/?name=${letter}&background=DBEAFE&color=2563EB&bold=true`,
  alt: `Parent avatar ${letter}`,
  width: 64,
  height: 64,
}));

export const CURRENT_ADMIN_AVATAR: DemoImage = {
  url: "https://ui-avatars.com/api/?name=John+Doe&background=1E3A8A&color=fff&bold=true",
  alt: "John Doe",
  width: 64,
  height: 64,
};

export const SAMPLE_STUDENT_AVATAR: DemoImage = {
  url: "https://ui-avatars.com/api/?name=Michael+Brown&background=DBEAFE&color=2563EB&bold=true",
  alt: "Michael Brown",
  width: 96,
  height: 96,
};

// ---------------------------------------------------------------------------
// 2. CLASS LEVELS
// ---------------------------------------------------------------------------

export const CLASS_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  name: `Class ${i + 1}`,
})) as ReadonlyArray<{ level: number; name: string }>;

// ---------------------------------------------------------------------------
// 3. ATTENDANCE (ledger view at /dashboard/attendance)
// ---------------------------------------------------------------------------

export type ClassAttendanceRow = {
  classLevel: number;
  className: string;
  section: string;
  totalStudents: number;
  present: number;
  absent: number;
  leave: number;
};

export const MOCK_TODAY_ATTENDANCE: ClassAttendanceRow[] = [
  { classLevel: 1, className: "Class 1", section: "A", totalStudents: 38, present: 36, absent: 1, leave: 1 },
  { classLevel: 2, className: "Class 2", section: "A", totalStudents: 40, present: 37, absent: 2, leave: 1 },
  { classLevel: 3, className: "Class 3", section: "A", totalStudents: 42, present: 39, absent: 3, leave: 0 },
  { classLevel: 4, className: "Class 4", section: "A", totalStudents: 41, present: 40, absent: 1, leave: 0 },
  { classLevel: 5, className: "Class 5", section: "A", totalStudents: 39, present: 35, absent: 3, leave: 1 },
  { classLevel: 6, className: "Class 6", section: "A", totalStudents: 44, present: 41, absent: 2, leave: 1 },
  { classLevel: 7, className: "Class 7", section: "A", totalStudents: 43, present: 40, absent: 3, leave: 0 },
  { classLevel: 8, className: "Class 8", section: "A", totalStudents: 45, present: 42, absent: 2, leave: 1 },
  { classLevel: 9, className: "Class 9", section: "A", totalStudents: 40, present: 36, absent: 4, leave: 0 },
  { classLevel: 10, className: "Class 10", section: "A", totalStudents: 37, present: 34, absent: 2, leave: 1 },
];

// ---------------------------------------------------------------------------
// 4. DASHBOARD (/dashboard)
// ---------------------------------------------------------------------------

export const DASHBOARD_STATS = [
  { label: "Total Students", value: "1,248", delta: "+12 this month", tone: "primary" as const },
  { label: "Total Teachers", value: "86", delta: "+2 this month", tone: "success" as const },
  { label: "Attendance Today", value: "92.5%", delta: "Present: 1,150", tone: "purple" as const },
  { label: "Fees Collected", value: "$24,580", delta: "+8.2% this month", tone: "warning" as const },
];

export const ATTENDANCE_TREND = [
  { date: "16 May", present: 1120, absent: 90 },
  { date: "17 May", present: 1180, absent: 60 },
  { date: "18 May", present: 1050, absent: 150 },
  { date: "19 May", present: 1190, absent: 55 },
  { date: "20 May", present: 1140, absent: 95 },
  { date: "21 May", present: 1080, absent: 130 },
  { date: "22 May", present: 1150, absent: 90 },
];

export const RECENT_ACTIVITIES = [
  { title: "New student admission", detail: "Michael Brown admitted to Class 6A", time: "2m ago", tone: "primary" as const },
  { title: "Fee payment received", detail: "Payment of $560 from James Smith", time: "15m ago", tone: "success" as const },
  { title: "Homework assigned", detail: "Maths homework assigned to Class 8B", time: "1h ago", tone: "purple" as const },
  { title: "Event published", detail: "Annual Sports Day published", time: "2h ago", tone: "warning" as const },
];

export const UPCOMING_EVENTS = [
  { title: "Annual Sports Day", when: "24 May 2025 · 9:00 AM", where: "School Playground" },
];

export const FEE_COLLECTION = {
  collectedPct: 62,
  collected: 24580,
  pending: 14980,
  overdue: 5240,
};

// ---------------------------------------------------------------------------
// 5. STUDENT PROFILE (/dashboard/students/[studentId])
// ---------------------------------------------------------------------------

export const SAMPLE_STUDENT = {
  id: "1",
  name: "Michael Brown",
  className: "Class 6A",
  rollNo: 23,
  email: "michael.brown@eduvision.com",
  phone: "+1 555-123-4567",
  status: "active" as const,
  avatar: SAMPLE_STUDENT_AVATAR,
  personal: {
    dateOfBirth: "10 Jan 2013",
    gender: "Male",
    address: "123 Maple Street, Springfield, USA",
    parentName: "David Brown",
    contact: "+1 555-987-6543",
  },
  academic: {
    className: "6A",
    section: "A",
    admissionNo: "EVS-2024-0623",
    admissionDate: "15 Jun 2024",
    rte: "No",
  },
  attendanceThisMonth: {
    present: 18,
    absent: 2,
    leave: 0,
  },
};

export const STUDENT_TABS = [
  "Overview",
  "Attendance",
  "Examinations",
  "Fees",
  "Documents",
  "Transport",
  "Timeline",
] as const;
