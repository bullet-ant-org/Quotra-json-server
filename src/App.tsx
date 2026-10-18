import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import Destination from "./pages/Destination";
import Community from "./pages/Community";
import Rewards from "./pages/Rewards";
import ForBusiness from "./pages/ForBusiness";
import Static from "./pages/Static";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/auth/AuthPage";
import Home from "./pages/app/Home";
import Wallet from "./pages/app/Wallet";
import Messages from "./pages/app/Messages";
import Notifications from "./pages/app/Notifications";
import Profile from "./pages/app/Profile";
import Settings from "./pages/app/Settings";
import { RequireAuth } from "./lib/auth/AuthContext";

// MapLibre is heavy; keep it out of the landing bundle.
const MapPage = lazy(() => import("./pages/MapPage"));
const guard = (el: React.ReactNode) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="explore" element={<Explore />} />
        <Route path="map" element={<Suspense fallback={<p className="p-10 text-muted">Loading map…</p>}><MapPage /></Suspense>} />
        <Route path="destinations/:slug" element={<Destination />} />
        <Route path="community" element={<Community />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="for-business" element={<ForBusiness />} />
        <Route path="about" element={<Static id="about" />} />
        <Route path="terms" element={<Static id="terms" />} />
        <Route path="privacy" element={<Static id="privacy" />} />
        <Route path="token-terms" element={<Static id="token-terms" />} />
        <Route path="guidelines" element={<Static id="guidelines" />} />

        <Route path="home" element={guard(<Home />)} />
        <Route path="wallet" element={guard(<Wallet />)} />
        <Route path="messages" element={guard(<Messages />)} />
        <Route path="messages/:id" element={guard(<Messages />)} />
        <Route path="notifications" element={guard(<Notifications />)} />
        <Route path="profile" element={guard(<Profile />)} />
        <Route path="settings" element={guard(<Settings />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* One auth page; the route that brought you here picks the starting form. */}
      <Route path="login" element={<AuthPage />} />
      <Route path="register" element={<AuthPage />} />
      <Route path="forgot-password" element={<AuthPage />} />
    </Routes>
  );
}
