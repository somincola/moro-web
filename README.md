# Moro Web

Marketing, download, support, and public trust site for the Moro iOS Mastodon client.

Production URL: `https://moro.somincola.com`

## Routes

- `/` — marketing page and interactive fictional timeline preview
- `/privacy` — Moro privacy policy
- `/security` — private vulnerability reporting policy and supported release
- `/transparency` — plain-language App, push, and website data flows
- `/releases` — current public App Store release and verification status
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
pnpm sync:release
pnpm test:release-sync
```

The production bundle is emitted to `dist/`.

## App Store URL

The production site links to Moro's permanent App Store listing by default:

```bash
https://apps.apple.com/app/id6776115614
```

Set `VITE_APP_STORE_URL` only when a deployment needs to override that destination, such as for a regional storefront or pre-release environment.

## Automatic App Store release data

The version, public release date, minimum iOS version, and update notes shown on
`/security` and `/releases` come from the committed
`src/data/app-store-release.json` snapshot.

`pnpm sync:release` requests Apple's public lookup endpoint for App Store ID
`6776115614`, validates both the ID and `com.somincola.moro` bundle identifier,
normalizes the update notes, and rewrites the snapshot only when public release
content changes. A failed or unexpected Apple response stops the update and
leaves the last verified snapshot intact.

`.github/workflows/sync-app-store-release.yml` runs every six hours and can also
be started manually. When Apple exposes a new public release, the workflow:

1. updates the release snapshot;
2. runs the release-sync tests and production build;
3. commits only the generated JSON to `main` as `github-actions[bot]`;
4. lets the existing Cloudflare Pages Git integration deploy that commit.

The workflow requires `contents: write` for its `GITHUB_TOKEN`. No App Store
Connect key or other repository secret is required. Apple's public lookup does
not expose the internal build number, so the website intentionally publishes the
customer-facing version instead.

GitHub automatically disables scheduled workflows in public repositories after
60 days without repository activity. If that happens, re-enable this workflow in
the Actions tab and use `workflow_dispatch` for an immediate manual refresh.

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

The privacy and transparency pages reflect the current Moro iOS implementation,
including this-device-only Keychain token storage, the encrypted Web Push → APNs
relay, and optional diagnostics supplied by Apple. The public website repository
is the version history for these commitments; the proprietary iOS repository
remains private. Have counsel review privacy, security, licensing, and terms copy
before treating it as final legal guidance.
