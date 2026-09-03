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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

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

export const apiClient = {
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
