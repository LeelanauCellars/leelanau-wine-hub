# Central v73 — Label Studio precision pass

## Label Studio

- Fixed live-text SVG export placement by using the exact same SVG text renderer in the editor canvas and exported SVG.
- Hex fields now use draft + Apply/Enter behavior, so a full value such as `#3B455A` can be typed without the artwork changing after every keystroke.
- Kept the native color picker alongside the hex field for quick visual changes.
- Split the supplied Illustrator front-label vector artwork into separate editable layers where the source structure is consistent:
  - Label Background
  - Leelanau Cellars Logo
  - Vintage Badge Outline / Additional Vector Artwork when present
  - Existing extracted text objects remain separate
  - Dieline remains its own locked layer
- Selecting the logo now exposes only the colors inside the logo, so it can be recolored without changing every other white object on the label.
- Global Label Colors remain available for intentional whole-label replacements, with clearer wording that they affect all matching artwork.
- Shape objects now expose separate fill, stroke, stroke width and corner controls.
- Bumped Label Studio browser-storage schema to v5 so older grouped v72 canvases do not override the improved source-layer structure.
- Added a Gemini quick prompt for recoloring the Leelanau Cellars Logo independently.

## Validation

- Verified Central stylesheet/import/original-asset checks.
- Verified LabelStudio.tsx parses/transpiles successfully with TypeScript's standalone transpiler.
- Verified all 14 supplied front-label documents now expose Label Background and Leelanau Cellars Logo as separate layers.
