export interface AcademicClass {
  _id: string;
  name: string;
  level: number;
  hasGroups: boolean;
  status: "ACTIVE" | "INACTIVE";
}

export interface AcademicSection {
  _id: string;
  classId: { _id: string; name: string; level: number } | string;
  name: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface AcademicGroup {
  _id: string;
  name: "Science" | "Commerce" | "Humanities";
  status: "ACTIVE" | "INACTIVE";
}
