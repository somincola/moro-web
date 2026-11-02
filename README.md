# Moro Web

Marketing, download, support, and public trust site for the Moro iOS Mastodon client.

Production URL: `https://getmoro.app` (the former `moro.somincola.com` should 301-redirect here)

## Routes

- `/` — marketing page and interactive fictional timeline preview
- `/privacy` — Moro privacy policy
- `/security` — private vulnerability reporting policy and project scope
- `/transparency` — plain-language App, push, and website data flows
- `/licenses` — direct third-party software and font notices
- `/terms` — Moro terms of use
- `/support` — support and contact links
- `/.well-known/security.txt` — machine-readable security contact

Cloudflare Pages rewrites direct requests to `index.html` through `public/_redirects`, while React selects the matching route.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

The production bundle is emitted to `dist/`.

### Prerendering and SEO

`pnpm build` runs three steps: the client build, an SSR build of
`src/entry-server.jsx`, and `scripts/prerender.mjs`, which writes a fully
rendered HTML file per route (`dist/index.html`, `dist/privacy.html`, …,
`dist/404.html`) with its own title, description, canonical URL and social
tags. The client hydrates that markup. Page metadata lives in `src/seo.js`;
add new routes there and in `App.jsx`.

- Hashed bundles are emitted to `/_app/` and cached immutably (`public/_headers`).
- There is no SPA catch-all in `public/_redirects`; unknown paths get `404.html`.
- `public/assets/og-image.png` is a 1200×630 capture of the homepage hero.
- Homepage screenshots ship at 480/600/720 px (`srcset`); regenerate all three
  sizes from moro-ios `screenshots/app-store/en-US/iphone/` when the UI changes.

## App Store URL

The production site links to Moro's permanent App Store listing by default:

```bash
https://apps.apple.com/app/id6776115614
```

Set `VITE_APP_STORE_URL` only when a deployment needs to override that destination, such as for a regional storefront or alternate deployment.

## Cloudflare Pages

Use a dedicated Pages project for this repository so the app site can deploy independently from `somincola.com` and `somincola.org`.

- Framework preset: Vite
- Build command: `pnpm build`
- Build output directory: `dist`
- Production branch: `main`
- Optional environment override: `VITE_APP_STORE_URL`
- Custom domain: `getmoro.app` (keep `moro.somincola.com` attached only to redirect to it)

The `somincola.com` zone can continue serving the company website while the `moro` subdomain points at this separate Pages project. The Somincola Garden Mastodon server and its web identity remain under `somincola.org`.

## Brand and content

- `public/assets/moro-app-icon.png` is the canonical AppIconClassic mark.
- The site has one fixed navy/ivory system; no theme or accent-color picker is included.
- Timeline accounts and posts are fictional.
- Photography is stored locally and documented in `ASSET_CREDITS.md`.

## Legal review

The privacy and transparency pages reflect the current Moro iOS implementation,
including this-device-only Keychain token storage, the encrypted Web Push → APNs
relay, and optional diagnostics supplied by Apple. The public website repository
provides the Git history for these commitments; the proprietary iOS repository
remains private. Have counsel review privacy, security, licensing, and terms copy
before treating it as final legal guidance.
