# Moro Web

Marketing, download, privacy, terms, and support site for the Moro iOS Mastodon client.

Production URL: `https://moro.somincola.com`

## Routes

- `/` — marketing page and interactive fictional timeline preview
- `/privacy` — Moro privacy policy
- `/terms` — Moro terms of use
- `/support` — support and contact links

Cloudflare Pages rewrites direct requests to `index.html` through `public/_redirects`, while React selects the matching route.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

The production bundle is emitted to `dist/`.

## App Store URL

The production site links to Moro's permanent App Store listing by default:

```bash
https://apps.apple.com/app/id6776115614
```

Set `VITE_APP_STORE_URL` only when a deployment needs to override that destination, such as for a regional storefront or pre-release environment.

## Cloudflare Pages

Use a dedicated Pages project for this repository so the app site can deploy independently from `somincola.com` and `somincola.org`.

- Framework preset: Vite
- Build command: `pnpm build`
- Build output directory: `dist`
- Production branch: `main`
- Optional environment override: `VITE_APP_STORE_URL`
- Custom domain: `moro.somincola.com`

The `somincola.com` zone can continue serving the company website while the `moro` subdomain points at this separate Pages project. The Somincola Garden Mastodon server and its web identity remain under `somincola.org`.

## Brand and content

- `public/assets/moro-app-icon.png` is the canonical AppIconClassic mark.
- The site has one fixed navy/ivory system; no theme or accent-color picker is included.
- Timeline accounts and posts are fictional.
- Photography is stored locally and documented in `ASSET_CREDITS.md`.

## Legal review

The privacy policy reflects the current Moro iOS implementation, including Keychain token storage and the encrypted Web Push → APNs relay. Have counsel review privacy and terms copy before public release.
