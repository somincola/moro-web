/* Single source of truth for page metadata — used by the client (on route
   render) and by scripts/prerender.mjs (baked into each static HTML file). */

export const SITE_URL = "https://moro.somincola.com";
export const APP_STORE_ID = "6776115614";
export const OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

export const ROUTES = {
  "/": {
    title: "Moro — A calmer home for the fediverse",
    description: "Moro is a calm, privacy-respecting Mastodon client for iPhone. Read, follow, and post across the fediverse from any Mastodon server.",
  },
  "/privacy": {
    title: "Privacy Policy — Moro",
    description: "Privacy policy for Moro, a Mastodon client for iPhone: what stays on your device, what goes to your server, and how push notifications work.",
  },
  "/terms": {
    title: "Terms of Use — Moro",
    description: "Terms of use for Moro, a Mastodon client for iPhone.",
  },
  "/transparency": {
    title: "Where your data goes — Moro",
    description: "Moro is a client, not a social network. The plain-language paths your information can take when you use the App or this website.",
  },
  "/security": {
    title: "Security — Moro",
    description: "Report a security problem in Moro privately, and see what is in scope and what happens after you report.",
  },
  "/licenses": {
    title: "Third-party software — Moro",
    description: "Third-party software and font licenses used by the Moro app and website.",
  },
  "/support": {
    title: "Support — Moro",
    description: "Get help with Moro: contact support, and find privacy, security, and legal information.",
  },
};

export const NOT_FOUND = {
  title: "Page not found — Moro",
  description: "The requested Moro page could not be found.",
};

export const metaFor = (path) => ROUTES[path] || NOT_FOUND;

export const normalizePath = (pathname) => (pathname || "/").replace(/\.html$/, "").replace(/\/+$/, "") || "/";
