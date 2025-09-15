// client/src/lib/http.ts
const BASE = import.meta.env.VITE_API_URL ?? "";

type Options = Omit<RequestInit, "body" | "method" | "headers"> & {
  method?: "GET"|"POST"|"PATCH"|"DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Generic function to make API requests.
 * Handles common tasks like setting headers, sending cookies, and parsing responses.
 *
 * @template T - The expected type of the response data.
 * @param {string} path - The API endpoint path (relative to the base URL).
 * @param {Options} opts - Optional configuration for the request.
 * @returns {Promise<T>} - A promise that resolves to the response data of type `T`.
 */
export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  // Destructure options and set default values
  const { method = "GET", body, headers, ...init } = opts;

  // Make the HTTP request using the Fetch API
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",           // send auth cookie
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

  // Try to parse JSON even on errors for consistent messages
  let data: any = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { /* noop */ }

  // If the response status is not OK (2xx), throw an error
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    const e = new Error(msg);
    (e as any).status = res.status;
    (e as any).payload = data;
    throw e;
  }
  
  return data as T;
}
