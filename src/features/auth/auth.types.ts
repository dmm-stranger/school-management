export type AccountStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "BLOCKED"
  | "PENDING_VERIFICATION";

export interface Role {
  id: string;
  name: string;
  label: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: Role[];
  profileType: "STUDENT" | "TEACHER" | "STAFF" | "GUARDIAN" | null;
  profileId: string | null;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  lastLogin: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
