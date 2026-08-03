/**
 * Central fetch wrapper. Every feature's api.ts should call through this
 * rather than calling fetch() directly, so auth headers, base URL, and
 * error handling stay in one place.
 *
 * TODO: point NEXT_PUBLIC_API_URL at the real backend once its base URL
 * and auth scheme (bearer header vs. httpOnly cookie — see
 * backend-architecture.md §6/§9) are confirmed.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not configured yet — this feature is running against no backend.",
      0,
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // backend uses httpOnly cookies for tokens
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      json?.message ?? "Request failed.",
      res.status,
      json?.errorCode,
    );
  }

  // Backend's success envelope: { success, message, data }
  return (json?.data ?? json) as T;
}
