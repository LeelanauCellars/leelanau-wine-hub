# Leelanau Cellars Central — v70

## Labels is now its own Central section
- Removed the Label Studio entry point from Projects.
- Added a top-level **Labels** tab for Admin and Sales access.
- Projects remain independent and no longer contain Label Studio controls.

## Label Library
- Added 14 bundled 2024 label packages from the supplied artwork archive.
- Each bundled entry includes the original Adobe Illustrator `.ai` file and matching two-page PDF.
- Added generated front/back previews for fast browsing in Central.
- Library cards provide direct Studio, PDF and AI-file actions.
- Added search across label names, vintages and filenames.

## Persistent uploads
- Admin users can create a Label Library entry and upload up to 8 related files at once.
- Supported originals: AI, PDF, PNG, JPG/JPEG and SVG.
- Uploaded files are stored using the same Vercel Blob infrastructure Central already uses for tasting-room uploads.
- Uploaded image/SVG files become the library preview automatically.
- Admin can remove uploaded library entries. Bundled originals are protected.

## Label Studio
- Studio now opens from Labels rather than Projects.
- Each label has an isolated sandbox document and browser-local version history.
- The original preview is added as a locked reference layer when available.
- Existing Gemini precision edits remain available.
- Existing editable text/shape/artwork layers, transforms, undo/redo, JSON and SVG exports remain available.

## Raster → SVG Vector Trace (beta)
- Added **Vector Trace PNG/JPG → SVG** inside Studio.
- Added **Trace Original Preview → SVG** for labels with a raster preview.
- Raster art is downscaled before tracing to keep generated SVGs manageable.
- Traced artwork is stored as a resolution-independent vector layer and preserved in SVG export.
- Important limitation: text inside a flattened PNG/JPG becomes vector outlines; it is not yet reconstructed as editable font text. Path-by-path editing and Gemini-assisted text reconstruction are future steps.

## Dependency
- Added `imagetracer@0.2.2` for browser-side raster vectorization.
