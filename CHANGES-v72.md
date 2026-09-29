# Central v72 — Label Studio color editing

## What changed
- Label Studio now exposes the actual fills and strokes inside imported SVG/vector artwork.
- Selecting a vector layer shows every editable solid fill/stroke as a color swatch; changing a swatch rewrites that SVG paint directly.
- A document-level Label Vector Colors palette can replace a vector color everywhere on the current front/back label.
- Added a dedicated Label Background control. For supplied Illustrator fronts, it detects the large die-cut background shape and recolors that real vector path. On backs without a full-background vector shape, it changes only the artboard background.
- Background detection was validated against all 14 supplied front/back label pairs.
- Changing the color of Illustrator outline text now recolors the exact original vector lettering without forcing it into a substitute live font.
- Gemini now receives the real fill/stroke palette for vector and outline-text layers.
- Gemini can issue `recolor` operations against exact SVG paint values and a `set-background` operation for the visible label background.
- If Gemini only describes a change but returns no applicable structured operation, Central now says nothing was changed instead of falsely reporting success.
- The local Gemini fallback can still handle basic background-color requests.
- Label Studio localStorage keys were bumped to v4 so stale v71 edits do not mask the new imported-color behavior.

## Still intentionally limited
- This does not yet expose every individual Illustrator path as a separate named layer. A vector object can contain many paths, but its distinct fills/strokes are now editable.
- Gradient/pattern fills are preserved but are not yet presented as simple color-picker swatches.
