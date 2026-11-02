import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import { AnalyticsManager } from "./AnalyticsManager.jsx";
import { App } from "./App.jsx";
import "./styles.css";

const container = document.getElementById("root");
const app = (
  <React.StrictMode>
    <App path={window.location.pathname} />
  </React.StrictMode>
);

// Pages are prerendered at build time; hydrate them. Fall back to a client
// render for the dev server, where #root starts empty.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);

// The consent banner is client-only, so it lives in its own root and never
// affects hydration of the prerendered page.
const consentRoot = document.createElement("div");
consentRoot.id = "consent-root";
document.body.appendChild(consentRoot);
createRoot(consentRoot).render(<AnalyticsManager />);
