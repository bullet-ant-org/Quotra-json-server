// Thin client for the Roamly API. Until VITE_API_URL is set, calls fail with
// ApiNotConfigured so the UI can say so instead of pretending to succeed.
export class ApiNotConfigured extends Error {
  constructor() {
    super("The Roamly API isn't connected yet.");
  }
}

const base = import.meta.env.VITE_API_URL as string | undefined;

export async function post<T>(path: string, body: unknown): Promise<T> {
  if (!base) throw new ApiNotConfigured();
  const res = await fetch(`${base}/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Something went wrong. Try again.");
  return data as T;
}
