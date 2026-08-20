"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "./auth.api";
import type { AuthUser, LoginPayload } from "./auth.types";
import { ApiClientError } from "@/lib/api-client";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  /** Convenience check used by UI to conditionally show elements (not a security boundary). */
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Maps each backend role name to where the user should land post-login.
// Mirrors school_erp_roles_and_dashboards.md — one shell, per-role landing route.
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  SUPER_ADMIN: "/dashboard/admin",
  ADMIN: "/dashboard/admin",
  PRINCIPAL: "/dashboard/principal",
  VICE_PRINCIPAL: "/dashboard/principal",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  GUARDIAN: "/dashboard/guardian",
  ACCOUNTANT: "/dashboard/accountant",
  STAFF: "/dashboard/staff",
  LIBRARIAN: "/dashboard/librarian",
  RECEPTIONIST: "/dashboard/receptionist",
  SPORT_OFFICER: "/dashboard/sport-officer",
};

export const resolveDashboardPath = (user: AuthUser | null): string => {
  if (!user || user.roles.length === 0) return "/login";
  return ROLE_DASHBOARD_MAP[user.roles[0].name] || "/dashboard";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const router = useRouter();

  const refetchUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await authApi.me();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: loggedInUser } = await authApi.login(payload);
      setUser(loggedInUser);
      setStatus("authenticated");
      router.push(resolveDashboardPath(loggedInUser));
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login");
    }
  }, [router]);

  const hasRole = useCallback(
    (roleName: string) => !!user?.roles.some((r) => r.name === roleName),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refetchUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiClientError };
