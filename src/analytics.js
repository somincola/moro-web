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
