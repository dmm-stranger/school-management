export const WORKING_DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;
export type WorkingDay = (typeof WORKING_DAYS)[number];

export type RoutineStatus = "DRAFT" | "ACTIVE" | "LOCKED" | "ARCHIVED";

export interface Period {
  _id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label?: string;
}

export interface RoutineEntry {
  _id: string;
  academicYearId: { _id: string; year: string } | string;
  classId: { _id: string; name: string } | string;
  sectionId: { _id: string; name: string } | string;
  groupId: { _id: string; name: string } | string | null;
  day: WorkingDay;
  period: number;
  subjectId: { _id: string; subjectName: string; subjectCode: string } | string;
  teacherId: { _id: string; employeeId: string; personalInfo: { fullName: string } } | string;
  roomId: { _id: string; buildingName: string; roomNumber: string } | string;
  startTime: string;
  endTime: string;
  status: RoutineStatus;
}

export interface RoutineScope {
  academicYearId: string;
  classId: string;
  sectionId: string;
  groupId?: string;
}

export interface GenerateRoutinePayload extends RoutineScope {
  roomId: string;
  days?: WorkingDay[];
}

export interface Conflict {
  type: string;
  message: string;
  entries: string[];
}
