import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./api-client";

/**
 * Central QueryClient config for the whole app.
 *
 * - staleTime: data is considered fresh for 30s, so navigating between
 *   pages that share data (e.g. Class dropdown used on 6 different forms)
 *   doesn't refetch on every mount.
 * - retry: never retry 4xx errors (bad request, not found, forbidden —
 *   retrying won't fix those), retry network/5xx errors up to twice.
 * - refetchOnWindowFocus: on, so data left stale in a background tab
 *   self-heals when the user comes back — useful for an admin tool left
 *   open all day.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError && error.statusCode < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
