const BASE = import.meta.env.VITE_API_URL ?? "";

type Options = Omit<RequestInit, "body" | "method" | "headers"> & {
  method?: "GET"|"POST"|"PATCH"|"DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, headers, ...init } = opts;
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

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    const e = new Error(msg);
    (e as any).status = res.status;
    (e as any).payload = data;
    throw e;
  }
  return data as T;
}
