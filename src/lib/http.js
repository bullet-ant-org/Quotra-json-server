import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const bad = (m) => new HttpError(400, m);
export const notFound = (m = "Not found") => new HttpError(404, m);
export const forbidden = (m = "You can't do that") => new HttpError(403, m);

// Wrap async handlers so thrown errors reach the error middleware.
export const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ message: err.issues[0]?.message ?? "Invalid input", issues: err.issues });
  if (err?.code === 11000) return res.status(409).json({ message: `That ${Object.keys(err.keyValue ?? {})[0] ?? "value"} is already taken.` });
  if (err?.name === "CastError") return res.status(404).json({ message: "Not found" });
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Something went wrong. Try again." : err.message });
}

export const page = (q) => {
  const limit = Math.min(50, Math.max(1, +(q.limit ?? 20)));
  return { limit, before: q.before ? new Date(q.before) : undefined };
};
