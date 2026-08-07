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
 *   1. MEDIA — images, avatars, logo/SVG paths (incl. About Us photos/avatars)
 *   2. ABOUT US SECTION — nav, page copy, and promo-card content for /about/*
 *   3. CLASS LEVELS — static Class 1–10 reference list
 *   4. ATTENDANCE (ledger) — per-class attendance rows
 *   5. DASHBOARD — stats, attendance trend, activities, events, fees
 *   6. STUDENT PROFILE — one sample student record
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

/** About Us section — building photos and committee/principal avatars. */
export const ABOUT_BUILDING_IMAGE: DemoImage = {
  url: "https://picsum.photos/seed/eduvision-about-building/1200/700",
  alt: "EduVision School main building",
  width: 1200,
  height: 700,
};

export const ABOUT_HISTORY_PHOTO: DemoImage = {
  url: "https://picsum.photos/seed/eduvision-history-1/900/560",
  alt: "EduVision School building, 2005",
  width: 900,
  height: 560,
};

export const PRINCIPAL_PHOTO: DemoImage = {
  url: "https://ui-avatars.com/api/?name=James+Anderson&background=1E3A8A&color=fff&size=256&bold=true",
  alt: "Dr. James Anderson, Principal",
  width: 256,
  height: 256,
};

export const COMMITTEE_MEMBERS: {
  name: string;
  role: string;
  title: string;
  avatar: DemoImage;
}[] = [
  { name: "Dr. James Anderson", role: "Chairman", title: "Educationist & Former University Professor", avatar: { url: "https://ui-avatars.com/api/?name=James+Anderson&background=DBEAFE&color=2563EB&bold=true", alt: "Dr. James Anderson", width: 96, height: 96 } },
  { name: "Mrs. Linda Thompson", role: "Vice Chairperson", title: "Business Consultant & Community Leader", avatar: { url: "https://ui-avatars.com/api/?name=Linda+Thompson&background=DBEAFE&color=2563EB&bold=true", alt: "Mrs. Linda Thompson", width: 96, height: 96 } },
  { name: "Mr. Rajesh Sharma", role: "Treasurer", title: "Chartered Accountant & Financial Advisor", avatar: { url: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=DBEAFE&color=2563EB&bold=true", alt: "Mr. Rajesh Sharma", width: 96, height: 96 } },
  { name: "Dr. Sarah Mitchell", role: "Academic Director", title: "Education Specialist & Curriculum Advisor", avatar: { url: "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=DBEAFE&color=2563EB&bold=true", alt: "Dr. Sarah Mitchell", width: 96, height: 96 } },
  { name: "Mr. David Wilson", role: "Member", title: "Entrepreneur & Industry Representative", avatar: { url: "https://ui-avatars.com/api/?name=David+Wilson&background=DBEAFE&color=2563EB&bold=true", alt: "Mr. David Wilson", width: 96, height: 96 } },
  { name: "Mrs. Anita Desai", role: "Member", title: "Social Worker & Community Advocate", avatar: { url: "https://ui-avatars.com/api/?name=Anita+Desai&background=DBEAFE&color=2563EB&bold=true", alt: "Mrs. Anita Desai", width: 96, height: 96 } },
  { name: "Mr. Michael Brown", role: "Member", title: "Parent Representative & Education Enthusiast", avatar: { url: "https://ui-avatars.com/api/?name=Michael+Brown&background=DBEAFE&color=2563EB&bold=true", alt: "Mr. Michael Brown", width: 96, height: 96 } },
  { name: "Ms. Priya Nair", role: "Member", title: "Alumni Representative & Education Advocate", avatar: { url: "https://ui-avatars.com/api/?name=Priya+Nair&background=DBEAFE&color=2563EB&bold=true", alt: "Ms. Priya Nair", width: 96, height: 96 } },
];

// ---------------------------------------------------------------------------
// 2. ABOUT US SECTION (/about/*)
// ---------------------------------------------------------------------------

export const ABOUT_NAV_ITEMS = [
  { label: "About Us", href: "/about" },
  { label: "Principal's Message", href: "/about/principals-message" },
  { label: "Mission & Vision", href: "/about/mission-vision" },
  { label: "History", href: "/about/history" },
  { label: "Management Committee", href: "/about/management-committee" },
] as const;

export const ABOUT_OVERVIEW = {
  intro:
    "EduVision School is dedicated to providing a world-class education that empowers students to become confident, compassionate, and responsible global citizens. We combine academic excellence with character building and co-curricular opportunities to help every student discover their potential and achieve their dreams.",
  stats: [
    { value: "20+", label: "Years of Excellence", tone: "primary" as const, icon: "graduation" as const },
    { value: "1,500+", label: "Happy Students", tone: "success" as const, icon: "users" as const },
    { value: "120+", label: "Expert Teachers", tone: "purple" as const, icon: "graduation" as const },
    { value: "50+", label: "Awards Won", tone: "warning" as const, icon: "trophy" as const },
  ],
  whyChoose: [
    "Experienced Faculty",
    "Modern Infrastructure",
    "Holistic Development",
    "Safe & Supportive Environment",
    "Proven Academic Excellence",
  ],
  exploreCards: [
    {
      slug: "principals-message",
      title: "Principal's Message",
      description: "A warm welcome from our Principal to all students, parents, and visitors.",
    },
    {
      slug: "mission-vision",
      title: "Mission & Vision",
      description: "Our commitment to excellence and the values that guide our journey.",
    },
    {
      slug: "history",
      title: "History",
      description: "A glimpse of our journey, milestones, and legacy over the years.",
    },
    {
      slug: "management-committee",
      title: "Management Committee",
      description: "Meet our dedicated management team and their leadership.",
    },
  ],
};

export const PRINCIPALS_MESSAGE = {
  quote: "Education is the most powerful weapon which you can use to change the world.",
  quoteAuthor: "Nelson Mandela",
  paragraphs: [
    "Welcome to EduVision School! As the Principal, I feel honored to lead an institution that is committed to academic excellence, character building, and holistic development.",
    "Our goal is to create a safe, inclusive, and inspiring environment where every student is encouraged to explore, learn, and grow. We believe in nurturing not only the mind but also the heart, preparing our students to become responsible global citizens and compassionate leaders of tomorrow.",
    "With the support of our dedicated faculty, caring staff, and involved parents, we strive to empower every child to achieve their dreams and make a positive impact on society.",
    "Thank you for being a part of our journey. Together, let us continue to inspire minds and shape futures.",
  ],
  signOff: "Dr. James Anderson",
  signOffTitle: "Principal, EduVision School",
  features: [
    { title: "Student-Centered Approach", description: "We focus on each student's unique strengths and potential.", tone: "primary" as const },
    { title: "Excellence in Education", description: "Delivering quality education through innovative teaching and learning.", tone: "success" as const },
    { title: "Values & Character", description: "Instilling integrity, respect, responsibility, and empathy in every student.", tone: "info" as const },
    { title: "Global Perspective", description: "Preparing students to thrive in a diverse and ever-changing world.", tone: "purple" as const },
  ],
};

export const MISSION_VISION = {
  intro:
    "Our mission and vision guide everything we do. They reflect our commitment to excellence in education and the holistic development of every student.",
  mission: {
    title: "Our Mission",
    tone: "success" as const,
    statement:
      "To provide a world-class education that empowers students to become confident, compassionate, and responsible global citizens.",
    points: [
      "Deliver academic excellence",
      "Foster creativity and critical thinking",
      "Encourage innovation and curiosity",
      "Build character and leadership",
      "Promote inclusivity and respect",
    ],
  },
  vision: {
    title: "Our Vision",
    tone: "purple" as const,
    statement:
      "To be a leading educational institution recognized for nurturing future leaders and making a positive impact on society.",
    points: [
      "Inspire lifelong learning",
      "Create a safe and nurturing environment",
      "Embrace technology and innovation",
      "Prepare students for a global future",
      "Strengthen partnerships with the community",
    ],
  },
  coreValues: [
    { title: "Integrity", description: "We act with honesty, transparency, and fairness.", tone: "primary" as const },
    { title: "Respect", description: "We value every individual and celebrate diversity.", tone: "success" as const },
    { title: "Responsibility", description: "We take ownership of our actions and decisions.", tone: "warning" as const },
    { title: "Excellence", description: "We strive for the highest standards in all we do.", tone: "purple" as const },
    { title: "Compassion", description: "We care for others and contribute to the community.", tone: "danger" as const },
  ],
};

export const HISTORY = {
  intro:
    "EduVision School was founded with a simple yet powerful belief – that every child deserves access to quality education in a safe, supportive and inspiring environment. Over the years, we have grown, evolved and achieved many milestones that reflect our commitment to excellence in education.",
  photoCaption: "The Beginning – 2005",
  milestones: [
    { year: "2005", title: "The Beginning", description: "EduVision School was established with 120 students and 8 dedicated teachers in a small campus.", tone: "success" as const },
    { year: "2009", title: "First Expansion", description: "New classrooms and science labs were added to accommodate our growing student community.", tone: "primary" as const },
    { year: "2013", title: "Academic Excellence", description: "Introduced advanced curriculum, digital learning and co-curricular activities to enhance student development.", tone: "purple" as const },
    { year: "2017", title: "Recognitions", description: "Received multiple awards for academic achievements, sports and community service.", tone: "warning" as const },
    { year: "2021", title: "Modern Campus", description: "New academic block, library and sports complex inaugurated with state-of-the-art facilities.", tone: "success" as const },
    { year: "2025", title: "Moving Forward", description: "Continuing our mission to nurture future leaders and make a positive impact on society.", tone: "info" as const },
  ],
  legacyStatement:
    "For nearly two decades, EduVision School has been a place where young minds discover their potential, build strong values and prepare to lead the world of tomorrow.",
  growthStats: [
    { value: "20+", label: "Years of Excellence", tone: "success" as const, icon: "users" as const },
    { value: "2,500+", label: "Students Educated", tone: "primary" as const, icon: "graduation" as const },
    { value: "150+", label: "Expert Teachers", tone: "purple" as const, icon: "users" as const },
    { value: "50+", label: "Awards & Recognitions", tone: "warning" as const, icon: "trophy" as const },
  ],
  achievements: [
    "Consistent academic excellence with outstanding results.",
    "State-of-the-art infrastructure and modern learning facilities.",
    "Strong focus on character building and leadership.",
    "Active participation in sports, arts and community service.",
    "Trusted by thousands of parents and guardians.",
  ],
};

export const MANAGEMENT_COMMITTEE_PAGE = {
  intro:
    "Our Management Committee is a dedicated group of experienced professionals, educators, and community leaders who provide strategic direction and oversight to ensure the school's mission and values are upheld.",
  responsibilities: [
    "Setting long-term goals and strategic direction",
    "Ensuring quality education and holistic development",
    "Overseeing school policies and financial management",
    "Supporting faculty, staff and student success",
    "Strengthening community partnerships and involvement",
  ],
};

/** Secondary sidebar "promo" card content, one per About sub-page (except the overview page, which uses a checklist instead — see about/page.tsx). */
export const ABOUT_PROMO_CARDS = {
  "principals-message": {
    image: ABOUT_HISTORY_PHOTO,
    heading: "Empowering Students to Shape a Brighter Tomorrow",
    description:
      "At EduVision School, we nurture curiosity, character, and creativity to help every student reach their full potential.",
    ctaLabel: "Enquire Now",
  },
  "mission-vision": {
    icon: "target" as const,
    heading: "Join the EduVision Family",
    description: "Be a part of a supportive community that inspires learning and growth.",
    ctaLabel: "Enquire Now",
  },
  history: {
    image: ABOUT_BUILDING_IMAGE,
    heading: "Our Journey Continues",
    description:
      "From a small beginning to a leading educational institution — our journey is built on trust, dedication and excellence.",
    ctaLabel: "Explore More About Us",
  },
  "management-committee": {
    image: ABOUT_BUILDING_IMAGE,
    heading: "Transparent Leadership",
    description:
      "Our management committee ensures strategic guidance, accountability and continuous improvement in all aspects of school life.",
    ctaLabel: "Contact Us",
  },
} as const;

// ---------------------------------------------------------------------------
// 3. CLASS LEVELS
// ---------------------------------------------------------------------------

export const CLASS_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  name: `Class ${i + 1}`,
})) as ReadonlyArray<{ level: number; name: string }>;

// ---------------------------------------------------------------------------
// 4. ATTENDANCE (ledger view at /dashboard/attendance)
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
// 5. DASHBOARD (/dashboard)
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
// 6. STUDENT PROFILE (/dashboard/students/[studentId])
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
