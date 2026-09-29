# v74 — Exact outline text editing + direct canvas drag

- Text wording changes no longer automatically switch original Illustrator outline text into a browser fallback font.
- Added exact glyph substitution for same-length edits when the needed glyphs exist in the imported Illustrator artwork (for example, 2024 → 2025 keeps the original Degular vector glyphs).
- Manual wording edits now use an Apply step and preserve the original font outlines whenever possible.
- If an exact outline edit cannot be reconstructed, Studio keeps the original lettering instead of silently substituting the wrong font and explains why.
- Font family/weight/size controls are hidden while an object remains in exact-outline mode; resizing the layer keeps the Illustrator lettering intact.
- Gemini update sanitization now returns only the properties Gemini actually requested, preventing unrelated font properties from being reapplied during simple edits.
- Gemini is instructed to edit outline text wording without font overrides and to scale outline text objects via width/height instead of fontSize.
- Reworked direct manipulation to use pointer capture on the selected layer itself. Unlocked objects can be dragged directly on the artboard and resized from the corner handle.
- Added keyboard nudging: Arrow keys move 1 px; Shift + Arrow moves 10 px.
- Added persistent on-canvas drag/nudge guidance and grab/grabbing cursors.
- Bumped Label Studio browser storage schema to v6 so broken live-font state from earlier prototypes does not carry forward.
