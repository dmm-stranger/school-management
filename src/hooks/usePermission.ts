"use client";

import { useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";

/**
 * UX-visibility helper only — mirrors backend authorize(). Hiding a button is
 * never security (FRONTEND-WORKING-FLOW.md §13); the API enforces every rule.
 * SUPER_ADMIN carries the "*" wildcard from the backend's flattened permissions.
 */
export function usePermission() {
  const { user } = useAuth();

  const can = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes("*") || user.permissions.includes(permission);
    },
    [user]
  );

  return { can };
}
