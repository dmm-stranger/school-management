export interface ExamResult {
  _id: string;
  examId: { _id: string; examName: string; examType: string; startDate: string; endDate: string } | string;
  studentId: { _id: string; studentId: string; personalInfo: { fullName: string } } | string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  position: number | null;
  status: "DRAFT" | "PUBLISHED";
}

export interface GenerateResultsPayload {
  examId: string;
  classId: string;
  sectionId: string;
  groupId?: string;
}
