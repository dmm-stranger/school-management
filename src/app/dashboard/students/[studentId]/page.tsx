import { StudentProfile } from "@/features/students/components/StudentProfile";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  // studentId isn't used yet — every profile shows the same mock student
  // until the Students module is wired to the backend (Step 5).
  await params;
  return <StudentProfile />;
}
