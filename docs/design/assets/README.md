# Brand assets and photographs

This session cannot reach the internet except for GitHub, so **nothing here can be fetched
automatically**. Files have to arrive by being committed to this repository. Once they are here, a
single command puts them into all 81 screens.

## 1. The crest — still needed

Every screen currently draws a **placeholder crest**: an SVG approximation built from a screenshot.
It is close enough to judge layout by and wrong for anything else.

Commit the real artwork here:

| File | What | Why |
|---|---|---|
| `crest.svg` | Full-colour crest, vector, **transparent background** | Used in the header of every screen and on every certificate. Vector stays sharp at every size and weighs a fraction of a retina PNG. |
| `crest.png` | Same at 1024px or larger, transparent | Only if no vector exists. |
| `crest-knockout.svg` | White or single-colour version | For dark mode and the green header bands. The full-colour crest has a white inner field, so it cannot sit on a dark ground. |
| `mark.svg` | The gear ring alone, square | Favicon and avatars. The full crest is illegible at 32px — the annulus text disappears. |

**Before exporting:** remove the white square background. The version supplied so far has one, and it
shows as a light box in dark mode and on every green panel.

## 2. Photographs — `photos/`

Drop real images in here — event photographs, plant visits, competitions, project builds — named by
what they show:

```
photos/plant-visit-01.jpg
photos/webinar-cad-01.jpg
photos/competition-gokart-01.jpg
photos/project-solar-dryer-01.jpg
```

JPEG, roughly 1600px on the long edge, under about 400KB each. A dozen is plenty to make every
screen look real.

Once they are committed, they get embedded directly into the canvas, which is the only way images
can appear there (see below).

## Why the canvas has no photographs today

The design canvas runs inside a sandboxed viewer whose content policy **blocks every external image
host**. An Unsplash or Picsum URL in the canvas renders as a broken image, not a photograph. The
only images that work are ones embedded in the page itself — which means having the files.

So the two surfaces differ on purpose:

| | Photographs |
|---|---|
| **Canvas** (`docs/design/canvas/`) | Drawn placeholders, until real files land here and get embedded |
| **Figma export** (`docs/design/figma/screens/`) | Real photographs by URL — those load in a normal browser, so imported Figma frames carry actual images |

Nothing about that is permanent. Commit the files and the canvas gets the same treatment.
