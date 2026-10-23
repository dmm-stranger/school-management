export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface NamedRef {
  _id: string;
  name: string;
}

/* ---------- Drivers ---------- */

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export type CreateDriverPayload = Omit<Driver, "_id" | "status">;
export type UpdateDriverPayload = Partial<CreateDriverPayload> & { status?: "ACTIVE" | "INACTIVE" };

/* ---------- Vehicles ---------- */

export type VehicleType = "BUS" | "MICROBUS" | "VAN" | "CAR";
export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface VehicleDriverRef {
  _id: string;
  name: string;
  phone: string;
  licenseNumber?: string;
}

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  type: VehicleType;
  seatCapacity: number;
  driverId: VehicleDriverRef | string | null;
  status: VehicleStatus;
  notes?: string | null;
}

export interface CreateVehiclePayload {
  vehicleNumber: string;
  type: VehicleType;
  seatCapacity: number;
  driverId?: string;
  notes?: string;
}

export type UpdateVehiclePayload = Partial<Omit<CreateVehiclePayload, "driverId">> & {
  status?: VehicleStatus;
  driverId?: string | null; // null explicitly unassigns the driver
};

/* ---------- Routes & stops ---------- */

export type FeeFrequency = "MONTHLY" | "TERM" | "ANNUAL";

export interface RouteVehicleRef {
  _id: string;
  vehicleNumber: string;
  seatCapacity: number;
  type?: VehicleType;
  driverId?: string;
}

export interface TransportRoute {
  _id: string;
  name: string;
  vehicleId: RouteVehicleRef | string;
  fee: number;
  feeFrequency: FeeFrequency;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface TransportRouteDetail extends TransportRoute {
  stops: TransportStop[];
  assignedCount: number;
}

export interface TransportStop {
  _id: string;
  routeId: string;
  name: string;
  sequence: number;
  pickupTime?: string | null;
  landmark?: string | null;
}

export interface CreateRoutePayload {
  name: string;
  vehicleId: string;
  fee: number;
  feeFrequency?: FeeFrequency;
  description?: string;
}
export type UpdateRoutePayload = Partial<CreateRoutePayload> & { status?: "ACTIVE" | "INACTIVE" };

export interface CreateStopPayload {
  routeId: string;
  name: string;
  sequence: number;
  pickupTime?: string;
  landmark?: string;
}

/* ---------- Assignments ---------- */

export type AssignmentStatus = "ACTIVE" | "ENDED" | "CANCELLED";

export interface AssignmentStudentRef {
  _id: string;
  personalInfo: { fullName: string };
  studentId: string;
}

export interface TransportAssignment {
  _id: string;
  studentId: AssignmentStudentRef | string;
  vehicleId: RouteVehicleRef | string;
  routeId: NamedRef | string;
  stopId: TransportStop | string;
  status: AssignmentStatus;
  startDate: string;
  endDate: string | null;
  remarks?: string | null;
}

export interface ListAssignmentsParams {
  page?: number;
  limit?: number;
  status?: AssignmentStatus;
  routeId?: string;
  vehicleId?: string;
  search?: string;
}

export interface CreateAssignmentPayload {
  studentId: string;
  routeId: string;
  stopId: string;
  remarks?: string;
}

/* ---------- Fees ---------- */

export type TransportFeeStatus = "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD" | "ONLINE_PAYMENT" | "CHEQUE";

export interface TransportFeeStudentRef {
  _id: string;
  personalInfo: { fullName: string };
  studentId: string;
}

export interface TransportFee {
  _id: string;
  studentId: TransportFeeStudentRef | string;
  assignmentId: string;
  routeId: NamedRef | string;
  amount: number;
  feeFrequency: FeeFrequency;
  paidAmount: number;
  dueAmount: number;
  status: TransportFeeStatus;
  createdAt: string;
}

export interface TransportFeesResult extends PaginatedResult<TransportFee> {
  pendingTotal: number;
}

export interface ListTransportFeesParams {
  page?: number;
  limit?: number;
  status?: TransportFeeStatus;
  search?: string;
}

/* ---------- My transport (student self-service) ---------- */

export interface MyTransport {
  assignment: TransportAssignment | null;
  fees: TransportFee[];
}

/* ---------- Summary ---------- */

export interface TransportSummary {
  vehicleCount: number;
  activeVehicles: number;
  driverCount: number;
  routeCount: number;
  activeAssignments: number;
  totalSeats: number;
  seatsAvailable: number;
  pendingFeeTotal: number;
  pendingFeeCount: number;
}
