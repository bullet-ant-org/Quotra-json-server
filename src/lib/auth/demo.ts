// DEMO MODE ONLY (VITE_DEMO_MODE=true and no VITE_API_URL). Lets the auth flows be
// clicked through locally. Nothing is sent anywhere; accounts live in this browser.
import type { AuthService, User } from "./service";

export const DEMO_OTP = "123456";
const KEY = "outsider-demo-session";

// Demo-only role accounts. These must never exist on a real backend.
export const DEMO_PASSWORD = "12345678";
const ACCOUNTS: Record<string, User> = {
  "user@gmail.com": { id: "me", firstName: "Ada", lastName: "Obi", username: "ada.obi", email: "user@gmail.com", role: "user" },
  "brand@gmail.com": { id: "b1", firstName: "Palmfringe", lastName: "Resort", username: "palmfringe", email: "brand@gmail.com", role: "brand" },
  "admin@gmail.com": { id: "admin", firstName: "Outsider", lastName: "Admin", username: "admin", email: "admin@gmail.com", role: "admin" },
};
const TAKEN = ["roamly", "admin", "adaeze.goes", "tunde_trails"];
const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));

const read = (): User | null => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
};
const save = (u: User) => { try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* demo only */ } return u; };

let pending: Omit<User, "id" | "role"> | null = null;
const registered = (): User[] => { try { return JSON.parse(localStorage.getItem("outsider-demo-accounts") ?? "[]"); } catch { return []; } };

const fromEmail = (email: string): User => {
  const name = email.split("@")[0].replace(/[^a-z]/gi, " ").trim() || "Explorer";
  const first = name.split(" ")[0];
  return { id: "me", role: "user", firstName: first[0].toUpperCase() + first.slice(1), lastName: "", username: first.toLowerCase(), email };
};

export const demoAuth: AuthService = {
  async me() { return read(); },
  async login(email, password) {
    await wait();
    const acct = ACCOUNTS[email.toLowerCase()];
    if (acct && password === DEMO_PASSWORD) return save(acct);
    const reg = registered().find((u) => u.email === email.toLowerCase());
    if (reg && password.length >= 10) return save(reg);
    throw new Error("That email and password don't match.");
  },
  googleUrl: () => null,
  async googleDemo() { await wait(); return save(ACCOUNTS["user@gmail.com"]); },
  async usernameAvailable(u) { await wait(350); return !TAKEN.includes(u.toLowerCase()); },
  async requestSignupOtp(d) { await wait(); pending = { firstName: d.firstName, lastName: d.lastName, username: d.username, email: d.email }; },
  async verifySignupOtp(email, code) {
    await wait();
    if (code !== DEMO_OTP) throw new Error("That code isn't right. Check your email and try again.");
    const u: User = { id: "me", role: "user", ...(pending ?? fromEmail(email)) };
    try { localStorage.setItem("outsider-demo-accounts", JSON.stringify([...registered(), { ...u, email: u.email.toLowerCase() }])); } catch { /* demo */ }
    return save(u);
  },
  async requestPasswordOtp() { await wait(); },
  async verifyPasswordOtp(email, code) {
    await wait();
    if (code !== DEMO_OTP) throw new Error("That code isn't right. Check your email and try again.");
    return save(read()?.email === email ? read()! : fromEmail(email));
  },
  async logout() { try { localStorage.removeItem(KEY); } catch { /* demo only */ } },
};
