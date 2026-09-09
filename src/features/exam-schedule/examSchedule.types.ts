export type ScheduleStatus = "DRAFT" | "SCHEDULED" | "ONGOING" | "COMPLETED" | "ARCHIVED";

export interface Invigilator {
  _id: string;
  teacherId: { _id: string; employeeId: string; personalInfo: { fullName: string } } | string;
  role: "MAIN" | "ASSISTANT";
  status: string;
}

export interface ExamSchedule {
  _id: string;
  examId: { _id: string; examName: string; examType: string; status: string } | string;
  classId: { _id: string; name: string } | string;
  sectionId: { _id: string; name: string } | string;
  groupId: { _id: string; name: string } | string | null;
  subjectId: { _id: string; subjectName: string; subjectCode: string } | string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomId: { _id: string; buildingName: string; roomNumber: string } | string;
  fullMarks: number;
  passMarks: number;
  status: ScheduleStatus;
  invigilators?: Invigilator[];
}

export interface CreateSchedulePayload {
  examId: string;
  classId: string;
  sectionId: string;
  groupId?: string;
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomId: string;
  fullMarks: number;
  passMarks: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
