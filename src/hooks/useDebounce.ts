"use client";

import { useEffect, useState } from "react";

/** Returns `value` after it has stopped changing for `delayMs` — protects against fast-typing request races. */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
