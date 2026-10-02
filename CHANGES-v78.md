# Central v78

## Tech Sheets

- Added per-sheet section visibility controls for Tasting Notes, Wine Specs, and Highlights. Turning a section off hides it from preview/print without deleting its draft content.
- Added Gemini Tech Sheet Assistant for Admin/Sales. Gemini returns a sanitized patch to the current tech-sheet draft only; it never writes back to Commerce7 or Wine Library source data.
- Gemini can show/hide sections, shorten/rewrite supplied copy, apply supported inline formatting, edit highlights, adjust permitted sheet values, and change layout settings.
- Added a local fallback for simple section visibility commands when Gemini is unavailable.
- Reworked the rich-text toolbar to preserve the user's text selection and use browser editing commands for Bold, Underline, Highlight, and Clear Formatting. Clear now removes formatting from the selected text rather than losing the selection when the toolbar is clicked.
- Existing lifestyle imagery, POS, packaging, bottle sizing, and sales-only fields remain unchanged.
