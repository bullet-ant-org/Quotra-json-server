import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./lib/auth/AuthContext";
import { loadPlaces } from "./lib/remote";
import { LIVE } from "./lib/store";

if (LIVE) loadPlaces().catch(() => {});

import { trackViewport } from "./lib/viewport";
trackViewport();
if (import.meta.env.PROD && "serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
