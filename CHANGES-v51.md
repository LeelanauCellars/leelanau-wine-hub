# v51 — Tasting Menu PDF → Notes automation

## Tasting Menu and Notes
- The official tasting-room PDF is now the source of truth for the Notes list.
- When Admin uploads a new menu PDF, Central extracts readable text from the PDF and stores a companion `.txt` file in Vercel Blob.
- The Notes wine selection automatically rebuilds from that extracted menu text.
- Existing Blob-hosted menu PDFs from v50 are supported: if a companion text file does not exist yet, Central extracts the text on first load and caches it.
- Matching now prefers the exact vintage listed on the menu and collapses duplicate vintages of the same wine to one current record.
- Admin can make corrections if PDF matching misses a wine. Corrections are saved to Blob with the current menu instead of relying on Commerce7 tasting-menu metadata.
- Tasting Room users no longer see menu-list management controls.

## Tasting-room page cleanup
- Condensed the Current Tasting Room Menu card to reduce top-of-page height.
- Tasting Room users get the actions they need: View PDF, Download PDF, and Print / Save Notes PDF.
- Replace Menu and Notes-list management remain Admin-only.
- Renamed the print action to “Print / Save Notes PDF.”

## Dependency
- Added `pdf-parse@2.4.5` for server-side PDF text extraction in Next/Vercel.
