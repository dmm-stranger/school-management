"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { NAV_GROUPS, NavGroup } from "@/config/navigation";

/**
 * Resolves the navigation tree visible to the current user.
 * Per 24-navigation-system.md §30: this is a UX-visibility layer only.
 * The backend's authenticate()/authorize() middleware remains the actual
 * security boundary — hiding a nav item here never substitutes for that.
 */
export function useNavigation(): NavGroup[] {
  const { user, hasRole } = useAuth();

  return useMemo(() => {
    if (!user) return [];

    const permissions = new Set(user.permissions);
    const isSuperAdmin = permissions.has("*");

    const canSee = (permission?: string, roles?: string[]) => {
      if (isSuperAdmin) return true;
      if (roles && !roles.some((r) => hasRole(r))) return false;
      if (permission && !permissions.has(permission)) return false;
      return true;
    };

    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => canSee(item.permission, item.roles)),
    })).filter((group) => group.items.length > 0);
  }, [user, hasRole]);
}
