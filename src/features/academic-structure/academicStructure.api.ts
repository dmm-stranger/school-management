import { apiClient } from "@/lib/api-client";
import type { AcademicClass, AcademicSection, AcademicGroup } from "./academicStructure.types";

export const academicStructureApi = {
  listClasses: () => apiClient.get<AcademicClass[]>("/classes"),
  listSections: (classId?: string) =>
    apiClient.get<AcademicSection[]>(`/sections${classId ? `?classId=${classId}` : ""}`),
  listGroups: () => apiClient.get<AcademicGroup[]>("/groups"),
};
