"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, resolveDashboardPath } from "@/features/auth/AuthContext";

export default function DashboardIndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const path = resolveDashboardPath(user);
    if (path !== "/dashboard") {
      router.replace(path);
    }
  }, [user, router]);

  return <div className="text-sm text-muted">Loading your dashboard…</div>;
}
