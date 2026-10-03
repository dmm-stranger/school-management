import { ApiClientError } from "./api-client";

/** Maps the backend's `{field, message}[]` validation errors onto form fields (FRONTEND-WORKING-FLOW.md §8). */
export const fieldErrorsFrom = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiClientError)) return {};
  const out: Record<string, string> = {};
  for (const e of error.errors) {
    // authorIds.0 → authorIds
    const key = e.field.split(".")[0];
    if (key && !out[key]) out[key] = e.message;
  }
  return out;
};

export const messageFrom = (error: unknown, fallback: string): string =>
  error instanceof ApiClientError ? error.message : fallback;
