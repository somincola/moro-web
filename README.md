# Moro Web

Marketing, download, support, and public trust site for the Moro iOS Mastodon client.

Production URL: `https://getmoro.app` (the former `moro.somincola.com` should 301-redirect here)

## Routes

- `/` — marketing page, interactive particle globe and responsive App Store screenshots
- `/privacy` — Moro privacy policy
- `/security` — private vulnerability reporting policy and project scope
- `/transparency` — plain-language App, push, and website data flows
- `/licenses` — direct third-party software and font notices
- `/terms` — Moro terms of use
- `/support` — support and contact links
- `/.well-known/security.txt` — machine-readable security contact

Cloudflare Pages serves a prerendered HTML file for each route and returns the dedicated 404 page for unknown paths.

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm check
```

The production bundle is emitted to `dist/`.

### Prerendering and SEO

`pnpm build` runs three steps: the client build, an SSR build of
`src/entry-server.jsx`, and `scripts/prerender.mjs`, which writes a fully
rendered HTML file per route (`dist/index.html`, `dist/privacy.html`, …,
`dist/404.html`) with its own title, description, canonical URL and social
tags. React runs only in the build renderer: visitors receive static HTML and
small progressive enhancements in `src/enhance.js`, with no React runtime or
hydration. Vite uses the same renderer in development. Page metadata lives in `src/seo.js`;
add new routes there and in `App.jsx`.

- Hashed bundles (`/_app/`) and optimized images (`/_media/`) are cached for one year with `immutable` (`public/_headers`). HTML keeps Pages' revalidation defaults.
- The particle code loads after paint when a scene is near the viewport. Footer scenes are not initialized at page startup; touch devices idle at 30fps and offscreen scenes pause.
- Initial text is visible without JavaScript. Only below-the-fold elements get a brief reveal animation.
- The small shared stylesheet is inlined into the HTML; subpage styles are included only on their pages. Initial rendering needs no external CSS request.
- Each page includes structured WebPage data; the homepage describes the iOS app and its screenshots. Subpages include breadcrumbs. Exact JSON-LD hashes are added to the script CSP during the build.
- The sitemap is generated from `ROUTES` and includes screenshot URLs. Pages preview domains are marked `noindex`.
- There is no SPA catch-all in `public/_redirects`; unknown paths get `404.html`.
- `public/assets/og-image.png` is a 1200×630 capture of the homepage hero.
- Homepage screenshots use `<picture>` with AVIF and WebP fallback at 320/480/600/720 px, native lazy loading, automatic rendered sizes with responsive fallbacks, asynchronous decoding and reserved aspect ratios.

### Updating images

Keep the canonical WebP screenshots in `public/assets/app/` aligned with the
approved App Store captures from moro-ios `screenshots/app-store/en-US/iphone/`.
After changing those source images, run:

```bash
pnpm images:optimize
pnpm build
pnpm check
```

Commit the generated files in `public/_media/` and
`src/home/images.generated.js`. Their content hashes change only when the image
bytes change, so CDN/browser caching is safe. Normal builds reuse these files
without re-encoding images. The same-origin Cloudflare Pages CDN serves them;
no separate image host or extra cross-origin connection is required.

`pnpm check` verifies the deployable routes, local asset references, image
dimensions and aspect ratios, crawlable navigation, structured data/CSP,
sitemap, 404 indexing, and a 20KB limit on initial JavaScript.

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
