export const BUILDING_NAMES = ["ACA-RED", "ACA-GREEN"] as const;
export type BuildingName = (typeof BUILDING_NAMES)[number];

export const FLOORS = ["GROUND_FLOOR", "FIRST_FLOOR", "SECOND_FLOOR", "THIRD_FLOOR"] as const;
export type Floor = (typeof FLOORS)[number];

export const ROOM_TYPES = [
  "CLASSROOM",
  "LAB",
  "COMPUTER_LAB",
  "LIBRARY",
  "PRINCIPAL_OFFICE",
  "STAFF_ROOM",
  "FINANCE_ROOM",
  "AUDITORIUM",
  "CAFETERIA",
  "MOSQUE",
  "STORE_ROOM",
  "WASHROOM",
  "BATHROOM",
  "GATE",
  "MEDICAL_ROOM",
  "EXAM_ROOM",
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "CLOSED"] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const FACILITIES = [
  "Whiteboard",
  "Projector",
  "Smart TV",
  "WiFi",
  "Air Conditioner",
  "Computer",
  "Printer",
  "Sound System",
  "CCTV",
  "Generator Backup",
] as const;
export type Facility = (typeof FACILITIES)[number];

export interface Room {
  _id: string;
  buildingName: BuildingName;
  roomNumber: string;
  floor: Floor;
  roomType: RoomType;
  status: RoomStatus;
  capacity: number;
  description?: string;
  facilities: Facility[];
  relatedUsers: { _id: string; email: string; profileType: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  buildingName: BuildingName;
  roomNumber: string;
  floor: Floor;
  roomType: RoomType;
  status?: RoomStatus;
  capacity: number;
  description?: string;
  facilities?: Facility[];
}

export type UpdateRoomPayload = Partial<CreateRoomPayload>;

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ListRoomsParams {
  page?: number;
  limit?: number;
  buildingName?: BuildingName;
  floor?: Floor;
  roomType?: RoomType;
  status?: RoomStatus;
  search?: string;
  sort?: string;
}

export interface BuildingSummary {
  buildingName: BuildingName;
  totalRooms: number;
  totalCapacity: number;
  floors: Floor[];
}
