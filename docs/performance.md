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
| First / Largest Contentful Paint | 0.90s | 0.60s |
| Speed Index | 4.06s | 1.38s |
| Total Blocking Time | 648ms | 7.5ms |
| Cumulative Layout Shift | 0 | 0 |
| Initial measured transfer | 630,414 bytes | 182,547 bytes |
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
The small shared stylesheet is inlined in the document, with the subpage
stylesheet included only on the corresponding pages. The final local audit
reported no render-blocking requests.

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

An initial public-network check after the first production deployment scored
84 for performance, with zero blocking time and zero layout shift. Network
requests varied substantially, and Lighthouse timed out fetching robots.txt;
a subsequent direct request confirmed the correct robots content. Inline CSS
was then added to remove the extra render-blocking network round trip, and
robots/sitemap responses were given a one-hour cache lifetime.

Cloudflare's existing JavaScript Detections and automatic Web Analytics
injection conflict with the site's strict script CSP, producing browser
console errors on the public domain. The CSP and bot-protection settings
were preserved. Local Lighthouse scores should not be presented as guaranteed
public-network or real-device scores.
