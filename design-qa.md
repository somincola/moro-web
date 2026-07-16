# Moro marketing website — design QA

## Comparison target

- Source visual truth: `/Users/nagihsu/.codex/generated_images/019f5e3b-396b-79f0-888d-14330df6feda/exec-0bd40e7f-0580-49f7-9630-1028a6fb268b.png`
- Final desktop implementation: `output/playwright/home-desktop-full-v2.png`
- Final mobile implementation: `output/playwright/home-mobile-top.png`
- Viewports: desktop `1440 × 1000`; mobile `390 × 844`
- State: home page, Local timeline selected; additional scroll and interaction states listed below

## Evidence

- Full-view comparison input: `output/playwright/qa-full-comparison.png`
- Focused hero comparison input: `output/playwright/qa-hero-comparison.png`
- Scroll-state evidence:
  - `output/playwright/home-desktop-story.png`
  - `output/playwright/home-desktop-network.png`
  - `output/playwright/home-desktop-privacy.png`
- Supporting route evidence:
  - `output/playwright/privacy-mobile.png`
  - `output/playwright/support-desktop.png`
- Mobile menu evidence: `output/playwright/home-mobile-menu-recheck.png`

The full-page browser capture cannot reproduce a sticky element at every scroll position simultaneously. The dark chapter therefore looks dimmer and includes more empty travel space in the full-page artifact than it does during use. The two dedicated story/network screenshots are the authoritative evidence for that interactive region.

## Required fidelity surfaces

- **Fonts and typography:** Newsreader Variable provides the editorial display serif and Inter Variable handles UI/body copy. The final desktop hero keeps the approved two-line headline, while mobile wraps to three balanced lines. Weights, line heights, and small UI text remain readable at both viewports.
- **Spacing and layout rhythm:** The implementation preserves the approved sequence: editorial hero, product timeline, dark conversation/network chapter, ivory privacy block, and centered download CTA. Desktop uses the same left-copy/right-product balance; mobile becomes a single column without horizontal overflow.
- **Colors and visual tokens:** The fixed system uses midnight navy, paper white, warm ivory, mist blue-gray, restrained gold, semantic red, and the icon’s cool blue. No lavender-led theme, theme selector, accent picker, or decorative gradient is present.
- **Image quality and asset fidelity:** The canonical AppIconClassic source asset is used everywhere. Timeline photography is locally stored at production resolution, cropped with `object-fit`, and credited. No placeholder art, emoji, inline SVG, or generated substitute replaces visible brand/product imagery.
- **Copy and content:** Marketing posts, accounts, conversations, and server examples are fictional. Privacy copy was updated against the current iOS implementation, including the self-hosted encrypted Web Push → APNs relay and on-device decryption. App Store badges use the permanent Apple ID `6776115614`, with `VITE_APP_STORE_URL` retained as an optional deployment override.
- **Icons:** Phosphor icons provide a consistent lightweight outline family. Active heart/bookmark states and the app-preview tab selection are visually and semantically distinct.
- **Accessibility:** Semantic headings, landmarks, tab roles, button labels, alt text, focus-visible outlines, reduced-motion handling, and practical mobile tap targets are present. The tested accessibility tree exposes selected/pressed states correctly.

## Interaction and route verification

- Mobile navigation opens and closes; Features, Privacy, Support, and App Store controls are reachable.
- Following, Local, and Federated preview tabs switch content.
- Like and bookmark controls update their visible count/state and `aria-pressed` values.
- App Store badges expose direct, accessible links to Moro's permanent listing in every route.
- `/privacy`, `/terms`, and `/support` load directly with correct document titles and no console errors.
- Browser console checks returned 0 errors and 0 warnings on the home, privacy, terms, and support routes.

## Comparison history

1. **P2 — desktop hero headline wrapped to three lines.**
   - Earlier evidence: `output/playwright/home-desktop-top.png`.
   - Fix: widened the hero copy track and reduced the desktop display size while preserving the mobile scale.
   - Post-fix evidence: `output/playwright/home-desktop-top-v2.png` and `output/playwright/qa-hero-comparison.png`; the approved two-line hierarchy is restored.
2. **P2 — scroll chapter stayed active for too much vertical travel.**
   - Earlier evidence: `output/playwright/home-desktop-full.png`.
   - Fix: reduced the sticky chapter from `190vh` to `150vh` and increased the network layer’s initial legibility.
   - Post-fix evidence: `output/playwright/home-desktop-full-v2.png`, `output/playwright/home-desktop-story.png`, and `output/playwright/home-desktop-network.png`; both states remain deliberate with a shorter transition.
3. **Rendering recheck — transient black tiles appeared in one immediate mobile menu capture.**
   - Earlier evidence: `output/playwright/home-mobile-menu.png`.
   - Recheck: no code change was required; a settled repaint in `output/playwright/home-mobile-menu-recheck.png` is clean, and console output remained empty.

## Findings

No actionable P0, P1, or P2 issues remain.

## Follow-up polish

- P3 resolved: App Store badges now link directly to Apple ID `6776115614`, and Safari can surface the matching Smart App Banner.
- P3: have counsel review the migrated policy and terms before production publication.

## Implementation checklist

- [x] Approved AppIconClassic applied consistently
- [x] Fixed single theme and non-lavender palette
- [x] Fictional product content and licensed local photography
- [x] Desktop and mobile layouts verified
- [x] Scroll states and primary controls verified
- [x] Legal/support direct routes verified
- [x] Console errors checked

final result: passed
