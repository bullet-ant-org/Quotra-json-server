import { apiBase, get, post } from "../api";
import { demoAuth } from "./demo";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "user" | "brand" | "admin";
}

export interface SignupDraft {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

// Proposed contract for the backend. Every method resolves only when the server
// has actually done the work; the UI never assumes success.
export interface AuthService {
  me(): Promise<User | null>;
  login(email: string, password: string): Promise<User>;
  googleUrl(next: string): string | null;
  googleDemo?(): Promise<User>;
  usernameAvailable(username: string): Promise<boolean>;
  requestSignupOtp(draft: SignupDraft): Promise<void>;
  verifySignupOtp(email: string, code: string): Promise<User>;
  requestPasswordOtp(email: string): Promise<void>;
  verifyPasswordOtp(email: string, code: string): Promise<User>;
  logout(): Promise<void>;
}

const apiAuth: AuthService = {
  me: () => get<{ user: User | null }>("/auth/me").then((r) => r.user).catch(() => null),
  login: (email, password) => post<{ user: User }>("/auth/login", { email, password }).then((r) => r.user),
  googleUrl: (next) => (apiBase ? `${apiBase}/v1/auth/google?next=${encodeURIComponent(next)}${refCode() ? `&ref=${refCode()}` : ""}` : null),
  usernameAvailable: (username) => post<{ available: boolean }>("/auth/username-available", { username }).then((r) => r.available),
  requestSignupOtp: (draft) => post("/auth/register/request-otp", { ...draft, ...(refCode() ? { ref: refCode() } : {}) }).then(() => undefined),
  verifySignupOtp: (email, code) => post<{ user: User }>("/auth/register/verify-otp", { email, code }).then((r) => r.user),
  requestPasswordOtp: (email) => post("/auth/password/request-otp", { email }).then(() => undefined),
  verifyPasswordOtp: (email, code) => post<{ user: User }>("/auth/password/verify-otp", { email, code }).then((r) => r.user),
  logout: () => post("/auth/logout", {}).then(() => undefined),
};

// Demo mode runs whenever no API is configured, unless explicitly switched off.
export const isDemo = !apiBase && import.meta.env.VITE_DEMO_MODE !== "false";
export const auth: AuthService = isDemo ? demoAuth : apiAuth;

// Invite code from a ?ref= link, remembered until signup.
function refCode(): string | null {
  try { const q = new URLSearchParams(location.search).get("ref"); if (q) localStorage.setItem("outsider-ref", q); return q ?? localStorage.getItem("outsider-ref"); } catch { return null; }
}
