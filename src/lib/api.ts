// Thin client for the Outsider API. Until VITE_API_URL is set, calls fail with
// ApiNotConfigured so the UI can say so instead of pretending to succeed.
export class ApiNotConfigured extends Error {
  constructor() {
    super("The Outsider API isn't connected yet.");
  }
}

export const apiBase = import.meta.env.VITE_API_URL as string | undefined;

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!apiBase) throw new ApiNotConfigured();
  const res = await fetch(`${apiBase}/v1${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Something went wrong. Try again.");
  return data as T;
}

export const post = <T>(path: string, body: unknown) => request<T>("POST", path, body);
export const get = <T>(path: string) => request<T>("GET", path);
