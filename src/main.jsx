import "@fontsource-variable/inter";
import "./styles.css";
import "./home/home.css";
import "./analytics.css";
import { enhanceNavigation, enhanceReveals, enhanceParticles, enhanceTableOfContents } from "./enhance.js";
import { initAnalyticsConsent } from "./analytics.js";

async function start() {
  // Production already contains the entire page. React is only a build-time
  // renderer; no runtime, virtual DOM or hydration is sent to visitors.
  if (document.querySelector(".m-sub") && !document.querySelector("[data-subpage-styles]")) {
    await import("./home/subpages.css");
  }
  enhanceNavigation();
  enhanceReveals();
  enhanceParticles();
  enhanceTableOfContents();
  initAnalyticsConsent();
}

start();
