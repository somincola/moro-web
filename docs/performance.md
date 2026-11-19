# Performance and SEO verification

Measured on November 19, 2026, against the production build of baseline
`8401379` and the optimized production build. Lighthouse 13.6.0 used its
default simulated mobile profile: 412×823, DPR 1.75, 4× CPU slowdown,
150ms RTT and 1,638.4Kbps throughput, with fresh browser storage.

These are local laboratory results; they exclude the public site's network
latency and do not represent measurements on a physical iPhone.

| Metric | Before | After |
| --- | ---: | ---: |
| Performance | 82 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| First / Largest Contentful Paint | 0.90s | 0.75s |
| Speed Index | 4.06s | 1.35s |
| Total Blocking Time | 648ms | 0ms |
| Cumulative Layout Shift | 0 | 0 |
| Initial measured transfer | 630,414 bytes | 183,145 bytes |
| Initial JavaScript, uncompressed | 308.34KB | 7.75KB |
| Initial JavaScript, gzip | 94.51KB | 3.12KB |
| All ten 720px screenshots | 585.3KiB WebP | 350.5KiB AVIF |

The final Lighthouse image-delivery audit reported no remaining image-size
savings. The 600px variants avoid the unnecessary jump from 480px to 720px
on intermediate pixel densities. WebP remains available as a fallback.

The existing visual layout and particle scene remain. Text and images are
prerendered, and the page no longer downloads React or hydrates an entire
component tree. Particle code loads separately when a scene is near the
viewport. The footer scene is not initialized during initial page startup.

Cloudflare Pages preview verification confirmed that the HTML, sitemap,
JavaScript, CSS, AVIF image and analytics bootstrap were available; sampled
assets matched the local build byte for byte. Images and bundles returned
`Cache-Control: public, max-age=31536000, immutable`, previews returned
`X-Robots-Tag: noindex`, and unknown paths returned HTTP 404 with no canonical.
JSON-LD was covered by the generated script CSP hashes.

`pnpm build` and `pnpm check` passed. Development-mode SSR was verified for
the homepage and privacy page. Chrome's existing session was used to check
desktop/mobile layout, screenshot rendering, navigation toggling and section
links. DOM regression checks covered navigation tone, Escape/resize closure,
scroll state, below-the-fold reveals and reduced-motion changes. Nineteen
consent/analytics assertions covered first visits, rejection, approval,
revocation, event tracking and blocked storage, without sending requests to
Google.

SEO additions include application/website/page entities, breadcrumbs,
image sitemap entries, descriptive accessible headings and a prebuilt legal
table of contents. Lighthouse already scored SEO 100 before the change;
the additional markup improves the site's crawlable information rather than
claiming a ranking increase.
