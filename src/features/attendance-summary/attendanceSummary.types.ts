export interface AttendanceCounts {
  PRESENT: number;
  ABSENT: number;
  LATE: number;
  LEAVE: number;
  HOLIDAY: number;
  HALF_DAY: number;
}

export interface MonthlySummary {
  studentId: string;
  month: number;
  year: number;
  counts: AttendanceCounts;
  percentage: number;
}

export interface YearlyMonthBreakdown {
  month: number;
  counts: AttendanceCounts;
  percentage: number;
}

export interface YearlySummary {
  studentId: string;
  year: number;
  overallPercentage: number;
  overallCounts: AttendanceCounts;
  monthly: YearlyMonthBreakdown[];
}
