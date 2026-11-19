export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || "G-XLBH2Y5PPJ";

export const ANALYTICS_CONSENT_KEY = "moro-analytics-consent";
export const ANALYTICS_PREFERENCES_EVENT = "moro:open-analytics-preferences";

export const ANALYTICS_EVENTS = {
  appStoreClick: "app_store_click",
  downloadSectionView: "download_section_view",
  supportContactClick: "support_contact_click",
};

export function getAnalyticsConsent() {
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return getAnalyticsConsent() === "granted";
}

export function saveAnalyticsConsent(value) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    return true;
  } catch {
    return false;
  }
}

export function trackEvent(eventName, parameters = {}) {
  if (!hasAnalyticsConsent() || typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    page_path: window.location.pathname,
    page_title: document.title,
    ...parameters,
  });
}

function loadAnalytics() {
  if (document.querySelector("[data-moro-analytics]")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  // External, same-origin bootstrap scripts comply with the site's CSP.
  // Google Analytics stays in the existing Partytown worker after consent.
  for (const src of [
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`,
    "/~partytown/moro-gtag.js",
  ]) {
    const script = document.createElement("script");
    script.type = "text/partytown";
    script.src = src;
    script.dataset.moroAnalytics = "";
    document.head.appendChild(script);
  }
  const bootstrap = document.createElement("script");
  bootstrap.src = "/~partytown/moro-bootstrap.js";
  bootstrap.async = true;
  document.head.appendChild(bootstrap);
}

export function initAnalyticsConsent() {
  const banner = document.querySelector(".analytics-consent");
  if (!banner) return;
  banner.hidden = getAnalyticsConsent() !== null;
  window.addEventListener(ANALYTICS_PREFERENCES_EVENT, () => {
    banner.hidden = false;
    banner.querySelector("button")?.focus();
  });
  banner.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-analytics-consent]");
    if (!choice) return;
    const saved = saveAnalyticsConsent(choice.dataset.analyticsConsent);
    banner.hidden = true;
    // Reloading also stops the worker when permission is revoked.
    if (saved) window.location.reload();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-analytics-preferences]")) {
      window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_EVENT));
    }
    const store = event.target.closest("a[data-store-location]");
    if (store) trackEvent(ANALYTICS_EVENTS.appStoreClick, { cta_location: store.dataset.storeLocation, link_url: store.href });
    const contact = event.target.closest("a[data-analytics-event]");
    if (contact) trackEvent(contact.dataset.analyticsEvent, { cta_location: "support_card", link_url: contact.href });
  });
  if (!hasAnalyticsConsent()) return;
  if ("requestIdleCallback" in window) window.requestIdleCallback(loadAnalytics, { timeout: 1500 });
  else window.setTimeout(loadAnalytics, 200);
  const download = document.getElementById("download");
  if (download && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackEvent(ANALYTICS_EVENTS.downloadSectionView, { section_id: "download" });
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(download);
  }
}
