import { apiClient } from "@/lib/api-client";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "./auth.types";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<{ userId: string; email: string }>("/auth/register", payload),

  login: (payload: LoginPayload) =>
    apiClient.post<{ user: AuthUser }>("/auth/login", payload),

  logout: () => apiClient.post<null>("/auth/logout"),

  verifyEmail: (payload: VerifyEmailPayload) =>
    apiClient.post<{ verified: boolean }>("/auth/verify-email", payload),

  resendOtp: (email: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") =>
    apiClient.post<{ sent: boolean }>("/auth/resend-otp", { email, purpose }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<{ sent: boolean }>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<{ reset: boolean }>("/auth/reset-password", payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<{ changed: boolean }>("/auth/change-password", payload),

  me: () => apiClient.get<AuthUser>("/auth/me"),
};
