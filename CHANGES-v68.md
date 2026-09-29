# Leelanau Cellars Central v68 — Label Studio prototype

This build adds Label Studio as an isolated module under **Projects** for Admin and Sales users. It is intentionally removable: the existing Projects files remain unchanged and the studio is opened only from the new project button/route.

## What is included

- **Projects → Open in Label Studio** for Pizza Wine, The Kicker, Sleeping Bear, and future Central projects.
- Layered label document model with text, shape, and image objects instead of a flattened AI-generated picture.
- Move and resize objects directly on the canvas; edit exact position, size, rotation, opacity, text, font, color, alignment, shape fill/corners, and image fit.
- Layer visibility, locks, reordering, duplication, and deletion.
- Add text, shapes, imported PNG/JPG/WEBP/SVG artwork, and a project-reference image.
- Undo/redo plus named version snapshots.
- Browser autosave per project for the prototype.
- Export the editable document as **SVG** and **JSON**.
- **Gemini Label Assistant** powered by the existing server-side `GEMINI_API_KEY`. Gemini returns structured edit operations; Central applies those operations to label objects rather than asking Gemini to redraw the label.
- Locked layers are protected both in the browser and server-side from Gemini edits.
- Simple local selected-layer edits remain available if Gemini is temporarily unavailable.

## Gemini configuration

Label Studio automatically uses the existing `GEMINI_API_KEY`. It can also reuse the Ask Central model settings. Optional overrides:

```env
LABEL_STUDIO_GEMINI_MODEL=gemini-3.5-flash-lite
LABEL_STUDIO_GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
```

## Prototype limitations / next steps

- Saved versions currently live in the browser, not in shared Central/Vercel storage.
- SVG and JSON are the production exports in this first pass. Native Adobe `.ai` export is not implemented yet; an Illustrator-compatible SVG can be opened and edited in Illustrator.
- Existing project PDFs remain reference files on the Project page. Label Studio can import raster/vector image artwork; direct PDF-to-editable-layer conversion is a later step.
- This pass does not attempt to auto-create regulatory copy or factual wine data. Those should ultimately be inserted from controlled Central fields/templates.
- A future phase can add shared project storage, print dimensions/bleed, PDF export, reusable brand/compliance blocks, curves/path text, clipping/die cuts, and a native Illustrator handoff workflow.

## Removal

If the experiment is not useful, remove the Label Studio component/API/schema and its route/button hooks. Existing Projects and their files are otherwise untouched.
