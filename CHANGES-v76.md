# v76 — Separate Tasting Menu and Tasting Notes

- Split the former **Tasting Menu and Notes** page into two separate Admin destinations:
  - **Tasting Menu** — current official menu PDF, View/Download, and Admin Replace Menu.
  - **Tasting Notes** — Admin-only notes workspace, web view, print preview, notes-list corrections, and Print / Save Notes PDF.
- Kept the existing automation intact: replacing the official Tasting Menu still extracts the PDF text and automatically rebuilds the Tasting Notes wine list.
- Hid **Tasting Notes** from the Tasting Room portal for now. Tasting Room staff can still view and download the current **Tasting Menu**.
- Added `/tasting-notes` as an Admin-only Central route.
- Reordered the Tasting Room portal so **Tasting Menu** is easier to reach.
- Tightened Tasting Notes fallback copy for wines that are not in the staff reference spreadsheet by selecting a concise sensory sentence instead of displaying long Commerce7 marketing copy.
- Refined the web Notes layout with cleaner category dividers and bordered wine rows.
- Improved print readability by reducing the Notes print layout from 8 wines per page to 7, giving each wine more vertical room while keeping the landscape format.
- Renamed print/report headings from **Tasting Menu and Notes** to **Tasting Notes**.
