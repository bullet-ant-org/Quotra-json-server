import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth, type User } from "./service";
import { disconnectSocket, loadFor } from "../remote";
import { FeedSkeleton } from "../../components/FeedSkeleton";

interface Ctx {
  user: User | null;
  ready: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start from the cached user so the app opens instantly; the server check runs in the background.
  const cached = (() => { try { return JSON.parse(localStorage.getItem("outsider-user") ?? "null") as User | null; } catch { return null; } })();
  const [user, setUserState] = useState<User | null>(cached);
  const [ready, setReady] = useState(!!cached);
  const setUser = useCallback((u: User | null) => { setUserState(u); try { if (u) localStorage.setItem("outsider-user", JSON.stringify(u)); else localStorage.removeItem("outsider-user"); } catch { /* */ } }, []);
  useEffect(() => { auth.me().then(setUser).catch(() => {}).finally(() => setReady(true)); }, [setUser]);
  useEffect(() => { loadFor(user).catch(() => {}); }, [user]);
  const logout = useCallback(async () => { await auth.logout().catch(() => {}); disconnectSocket(); try { localStorage.removeItem("outsider-live-cache"); } catch { /* */ } setUser(null); }, [setUser]);
  return <AuthCtx.Provider value={{ user, ready, setUser, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}

export const homeFor = (role?: User["role"]) => (role === "admin" ? "/admin" : role === "brand" ? "/brand" : "/home");

export function RequireAuth({ children, role }: { children: ReactNode; role?: User["role"] }) {
  const { user, ready } = useAuth();
  const { pathname } = useLocation();
  if (!ready) return <FeedSkeleton />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
