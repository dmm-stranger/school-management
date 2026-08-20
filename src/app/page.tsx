"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { resolveDashboardPath } from "@/features/auth/AuthContext";

export default function Home() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      router.replace(resolveDashboardPath(user));
    }
  }, [status, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-sm text-muted">Loading…</div>
    </main>
  );
}
