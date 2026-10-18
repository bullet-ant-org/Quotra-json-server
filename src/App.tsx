import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthLayout, Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import Destination from "./pages/Destination";
import Community from "./pages/Community";
import Rewards from "./pages/Rewards";
import ForBusiness from "./pages/ForBusiness";
import Static from "./pages/Static";
import NotFound from "./pages/NotFound";
import { ForgotPassword, Login, Register } from "./pages/Auth";

// MapLibre is heavy; keep it out of the landing bundle.
const MapPage = lazy(() => import("./pages/MapPage"));

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
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  );
}
