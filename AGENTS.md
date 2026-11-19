# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Moro design decisions

- Use `public/assets/moro-app-icon.png` as the canonical brand mark. The previous full-body cream elephant is retired.
- Keep one fixed visual system: midnight navy, warm ivory, paper white, mist blue-gray, and restrained semantic red/blue. Do not add a theme or accent-color picker and do not return to lavender-led branding.
- Marketing timelines must use fictional accounts, posts, servers, and conversations. Landscape media may use locally stored, appropriately licensed photography with source credits.
- Keep the hero product preview at the modern iPhone portrait ratio (19.5:9). Let `aspect-ratio` calculate its height from a responsive width; avoid fixed-height or 9:16 treatments that make it feel tablet-like.
- The implemented homepage and the design tokens in `src/styles.css` are the current visual baseline.
- Homepage (Nov 2026 redesign) lives in `src/home/` (`HomePage.jsx`, `home.css`, `particleGlobe.js`), scoped under `.m-site`. It deliberately echoes the iOS app: pure monochrome (night #050608 / white), Inter only, hairlines, real App Store screenshots in thin black device frames. The full-screen hero is a canvas port of the app's onboarding particle globe (moro-ios `moro/Modules/Onboarding/OnboardingGlobeView.swift`) with "Moro / FOR MASTODON" beneath it, as in the app. Keep it extremely clean: no gold/colour accents, glows-as-decoration, floating chips, marquees or looping UI animations; motion is one soft fade. The user rejected a flashier version as not elegant.
- Homepage screenshots in `public/assets/app/*.webp` come from moro-ios `screenshots/app-store/en-US/iphone/` (720px wide WebP). Regenerate from there when the app UI changes.
- Every route is prerendered at build time (`scripts/prerender.mjs`, metadata in `src/seo.js`). React runs only in the build/dev renderer; `src/enhance.js` progressively enhances the HTML without hydration. Render code must not read `window`/`document`; pass the path via props/`PathContext`. Keep initial text visible without JavaScript and keep the globe's per-frame cost low (cached sprites, adaptive detail, deferred visible scenes).
- Optimized screenshots and small UI images are generated with `pnpm images:optimize` into `public/_media/`, with content hashes and immutable caching. Commit the output and `src/home/images.generated.js`; normal builds must not re-encode every image. Run `pnpm build && pnpm check` after changes to rendering, asset references or SEO.

