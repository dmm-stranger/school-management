const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

class ApiClientError extends Error {
  statusCode: number;
  /** Field-level validation errors, per backend's validate.middleware.js / ApiError shape. */
  errors: ApiFieldError[];

  constructor(message: string, statusCode: number, errors: ApiFieldError[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Endpoints that must never trigger a refresh-and-retry — refreshing on a
// failed login/refresh call itself would loop forever.
const AUTH_ENDPOINTS_NO_RETRY = ["/auth/login", "/auth/refresh-token", "/auth/register"];

/**
 * The access token cookie is short-lived (15m, per backend JWT config) by
 * design — it's meant to be silently renewed via the refresh token (7d),
 * not something the user re-enters. Without this, every request fails with
 * 401 fifteen minutes after login, which is exactly the bug this fixes.
 *
 * A single in-flight refresh is shared across every request that hits a
 * 401 at the same time (e.g. a page firing several API calls at once),
 * instead of each one independently calling /auth/refresh-token.
 */
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  const redirect = encodeURIComponent(window.location.pathname);
  // api-client.ts is a plain module, not a React component/hook, so
  // useRouter() isn't available here — and a full page reload is actually
  // wanted on session expiry, to reset all in-memory client state, not
  // just soft-navigate while stale data lingers in memory.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/login?redirect=${redirect}`;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  // Silently refresh and retry exactly once on an expired access token.
  if (res.status === 401 && !isRetry && !AUTH_ENDPOINTS_NO_RETRY.includes(endpoint)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(endpoint, options, true);
    }
    // Refresh token is also expired/invalid — this is a real session
    // expiry, not a transient issue. Send the user back to login instead
    // of leaving every page silently empty.
    redirectToLogin();
  }

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new ApiClientError(
      json.message || "Request failed",
      res.status,
      (json as unknown as { errors?: ApiFieldError[] }).errors || []
    );
  }

  return json.data;
}

/**
 * Authenticated binary download (report exports). A plain <a href> can't be used: the access
 * token is a short-lived cookie, and a bare navigation gets a 401 page instead of the silent
 * refresh `request()` performs. This does the same refresh-once-and-retry, then hands back the
 * file as a Blob. Errors arrive as JSON from the API, so they are parsed into an ApiClientError
 * (e.g. the 410 "this report has expired" message) rather than saved as a corrupt file.
 */
async function download(endpoint: string, isRetry = false): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: "include" });

  if (res.status === 401 && !isRetry) {
    if (await refreshAccessToken()) return download(endpoint, true);
    redirectToLogin();
  }

  if (!res.ok) {
    let message = "Download failed";
    let errors: ApiFieldError[] = [];
    try {
      const json = await res.json();
      message = json.message || message;
      errors = json.errors || [];
    } catch {
      // body wasn't JSON — keep the generic message
    }
    throw new ApiClientError(message, res.status, errors);
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return { blob: await res.blob(), filename: match?.[1] ?? "download" };
}

export const apiClient = {
  download,
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export { ApiClientError };
