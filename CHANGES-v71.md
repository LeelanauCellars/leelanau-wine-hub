# Central v71 — Label Studio import rebuild

## Why this version exists
v70 opened supplied Illustrator/PDF labels as a faded raster reference and then added a generic text object on top. That was not a real editable import and produced duplicate/misaligned artwork.

## What changed
- Labels remains a standalone top-level Central section, separate from Projects.
- The 14 supplied 2024 Illustrator files are now preprocessed from their actual PDF-compatible `.ai` artwork into compact editable Studio documents.
- Front and back labels can be switched directly in Studio.
- Original vector artwork is preserved as SVG rather than a low-opacity PNG reference.
- PDF text objects are detected and exposed as individual editable text layers.
- Original Illustrator lettering is preserved as exact vector outlines until the wording/font is changed, preventing the imported design from visually shifting just because a font is unavailable in the browser.
- The dieline/cut path is its own locked layer and can be hidden/unlocked independently.
- The old fake starter wine-name overlay is removed.
- v71 uses new localStorage keys, so stale v70 Studio canvases do not overwrite the rebuilt import.
- PNG/JPG Vector Trace now breaks the trace into multiple editable vector objects instead of inserting one monolithic SVG object.
- SVG export preserves exact outline text until a text object is deliberately converted to live editable text.

## Current limitation
A flattened PNG/JPG cannot reveal the original Illustrator layer names or fonts. Vector Trace reconstructs shapes/colors as editable vectors. Text from a flattened raster begins as vector outlines; rebuilding raster text as semantic live text is a later Smart Convert step.
