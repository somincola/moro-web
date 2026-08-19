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
