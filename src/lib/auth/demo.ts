// DEMO MODE ONLY (VITE_DEMO_MODE=true and no VITE_API_URL). Lets the auth flows be
// clicked through locally. Nothing is sent anywhere; accounts live in this browser.
import type { AuthService, User } from "./service";

export const DEMO_OTP = "123456";
const KEY = "roamly-demo-session";
const TAKEN = ["roamly", "admin", "adaeze.goes", "tunde_trails"];
const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));

const read = (): User | null => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
};
const save = (u: User) => { try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* demo only */ } return u; };

let pending: Omit<User, "id"> | null = null;

const fromEmail = (email: string): User => {
  const name = email.split("@")[0].replace(/[^a-z]/gi, " ").trim() || "Explorer";
  const first = name.split(" ")[0];
  return { id: "demo", firstName: first[0].toUpperCase() + first.slice(1), lastName: "", username: first.toLowerCase(), email };
};

export const demoAuth: AuthService = {
  async me() { return read(); },
  async login(email, password) {
    await wait();
    if (password.length < 6) throw new Error("That email and password don't match.");
    return save(read()?.email === email ? read()! : fromEmail(email));
  },
  googleUrl: () => null,
  async googleDemo() { await wait(); return save({ id: "demo", firstName: "Ada", lastName: "Obi", username: "ada.obi", email: "ada@example.com" }); },
  async usernameAvailable(u) { await wait(350); return !TAKEN.includes(u.toLowerCase()); },
  async requestSignupOtp(d) { await wait(); pending = { firstName: d.firstName, lastName: d.lastName, username: d.username, email: d.email }; },
  async verifySignupOtp(email, code) {
    await wait();
    if (code !== DEMO_OTP) throw new Error("That code isn't right. Check your email and try again.");
    return save({ id: "demo", ...(pending ?? fromEmail(email)) });
  },
  async requestPasswordOtp() { await wait(); },
  async verifyPasswordOtp(email, code) {
    await wait();
    if (code !== DEMO_OTP) throw new Error("That code isn't right. Check your email and try again.");
    return save(read()?.email === email ? read()! : fromEmail(email));
  },
  async logout() { try { localStorage.removeItem(KEY); } catch { /* demo only */ } },
};
