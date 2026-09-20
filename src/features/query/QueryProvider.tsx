"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState ensures one QueryClient per app instance, not recreated on
  // every render — the standard TanStack Query + Next.js App Router pattern.
  const [client] = useState(() => queryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
