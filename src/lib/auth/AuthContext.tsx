import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth, type User } from "./service";
import { disconnectSocket, loadFor } from "../remote";

interface Ctx {
  user: User | null;
  ready: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { auth.me().then(setUser).finally(() => setReady(true)); }, []);
  useEffect(() => { loadFor(user).catch(() => {}); }, [user]);
  const logout = useCallback(async () => { await auth.logout().catch(() => {}); disconnectSocket(); setUser(null); }, []);
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
  if (!ready) return <p className="p-10 text-muted">Loading…</p>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
