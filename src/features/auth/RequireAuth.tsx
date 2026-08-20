"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

interface RequireAuthProps {
  children: ReactNode;
  /** If provided, user must hold at least one of these roles or gets redirected to /403. */
  allowedRoles?: string[];
}

/**
 * Client-side route guard. This is a UX convenience layer only — the backend's
 * authenticate()/authorize() middleware remains the actual security boundary.
 * See FRONTEND-WORKING-FLOW.md §13 (Security-Aware UI Behavior).
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (status === "authenticated" && allowedRoles && user) {
      const permitted = user.roles.some((role) => allowedRoles.includes(role.name));
      if (!permitted) {
        router.replace("/403");
      }
    }
  }, [status, user, allowedRoles, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted">Loading…</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // redirect effect is in flight
  }

  return <>{children}</>;
}
