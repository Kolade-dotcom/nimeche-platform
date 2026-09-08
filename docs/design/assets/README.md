# Brand assets

## Wanted: the real crest

Every screen currently draws a **placeholder crest** — an inline SVG approximation of the NiMechE
emblem, built from the raster screenshot supplied in conversation. It is close enough to judge
layout by and wrong for anything else.

Drop the real file in here as **`crest.png`** (or `crest.svg`, preferred) and the swap is one
command — the crest is generated from a single function, so every artboard picks it up at once.

**What to put here**

| File | What it is | Used for |
|---|---|---|
| `crest.svg` | The full-colour crest, vector, transparent background | Everywhere. Vector is strongly preferred — it stays sharp at every size and is a fraction of the weight of a retina PNG on a page that shows it in the header of every screen. |
| `crest.png` | Same, at 512px or larger, transparent background | Fallback if no vector exists. |
| `crest-knockout.svg` | White/single-colour version | Dark mode, and the green header bands. The full-colour crest has a white inner field, so it cannot sit directly on a dark ground (design plan section 2.3). |
| `mark.svg` | The gear ring alone, or a simplified device, square | Favicon, app icon, avatars. The full crest is illegible at 32px — the annulus text disappears. |

**Notes on preparing them**

- **Remove the white background.** The supplied raster has a white square behind the crest, which shows as a light box in dark mode and on the green panels.
- Trim to the artwork's own bounds, with no padding — the layouts add their own spacing.
- If only a JPEG exists, a vector redraw is worth commissioning once; it is used at a dozen sizes across the product and on every certificate.

Until these land, the placeholder stays and section 2.2 of the design plan keeps the branding
sign-off flagged as blocking.
