# Leelanau Cellars Wine Hub

A private internal wine-knowledge and sales-material app designed to live on Vercel and run as a Commerce7 app/extension.

## What is included

- **Wine Library** — a searchable master profile for every wine.
- **Editable master content** — tasting notes, staff pitch, pairings, highlights, awards, technical data and production/vineyard notes.
- **Commerce7 sync** — pulls Wine products from the Product API and maps product name, image, vintage, varietal, appellation, price, UPC, bottle volume and variant alcohol percentage automatically.
- **Shared Wine Hub fields in Commerce7** — when the app has Product write access, master Wine Hub content, awards and the current tasting-menu flag are stored in the product `metaData`, so sales/tasting-room staff share the same information.
- **Tasting Room Guide** — select the current menu, save it, and print a staff-ready reference guide built from the same master records.
- **Tech Sheet Builder** — starts from the master record but permits document-only overrides. The print layout mirrors the supplied Leelanau sales one-sheet: blue logo header, light-blue title bar, copy on the left, bottle/award visual on the right and a black footer.
- **Awards Library** and **Asset Library** — reusable information attached to the wine profile. Current San Francisco Chronicle awards are refreshed from `lwc.wine/awards` when the Commerce7 catalog syncs.
- **Demo/local fallback** — if Commerce7 is not configured, the included sample catalog and browser localStorage let the workflow be tested immediately.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Connect Commerce7

Create a private Commerce7 app with Product access. **Read** access is enough to test catalog sync; **Full** Product access is required if staff should save Wine Hub edits and tasting-menu status back to Commerce7.

Add these variables to `.env.local` and to the Vercel project:

```bash
COMMERCE7_APP_ID=your-app-id
COMMERCE7_APP_SECRET=your-secret-key
COMMERCE7_TENANT_ID=your-tenant-id
```

The secret is only read by server-side API routes and is never sent to the browser.

## Wine Hub custom fields / metadata

The app reads and writes the following Product `metaData` keys. Matching Product Custom Fields can be created in Commerce7 so the information can also be maintained there when useful:

- `tech_abv`
- `tech_rs`
- `tech_ta`
- `tech_ph`
- `tech_case_pack`
- `tech_cases_produced`
- `tech_sweetness`
- `tech_tasting_notes`
- `tech_short_description`
- `tech_staff_pitch`
- `tech_pairings`
- `tech_highlights` — newline-separated
- `vineyard_notes`
- `production_notes`
- `tech_awards_json` — JSON array of award objects
- `tech_on_tasting_menu` — `true` / `false`

Standard Commerce7 product facts remain managed in Commerce7 itself. In the Wine Hub, those fields are displayed as synced without duplicating them as a second editable record.

## Commerce7 extension

The app includes Commerce7's iframe helper script. In the Commerce7 App Development Center, add a **Store Menu Page** pointing to the deployed Vercel URL. A **Product Detail Context Menu** or **Product Detail Tab** can also point to the same app so staff can jump directly from a product to the Wine Hub.

## Data model notes

With Commerce7 connected, product facts and Wine Hub custom fields are shared through Commerce7. Browser localStorage remains a fallback/cache for demo use. If you later want versioned tasting menus, approval workflows, staff roles, archived generated documents or a full audit history, add a small shared database layer without changing Commerce7 as the system that owns the core product data.


## Brand logos

Tech sheets automatically switch the header logo for Farm Fresh, Country Crush, Zilly and Lakeshore Farms based on the Commerce7 product title/collections. The current implementation uses the approved logo assets hosted on the Leelanau/Farm Fresh websites.


## v3 workflow updates

- Commerce7 descriptions now decode HTML entities before display, including smart apostrophes/quotes, umlauts, dashes, bullets and numeric entities.
- The first paragraph of the Commerce7 long description becomes the default tasting note.
- The tech-sheet Highlights section looks for headings such as **Why You'll Love It**, **The Difference**, **The Craft**, **Highlights**, and similar sections, then uses the copy underneath without printing the heading itself.
- 12-digit UPCs are displayed in the sales format `0-84690-20004-2` while the underlying Commerce7 value stays unchanged.
- Tech-sheet bottle scale now starts at `2.20×` and can be reduced to `0.80×`.
- Case Packaging is an optional document-only section. Sales can paste an image URL or upload an image for the current sheet.
- The current 2026 San Francisco Chronicle results continue to come from the Awards page. For supported Leelanau Cellars, Farm Fresh and Zilly awards, the tech sheet uses the winery's official 2026 award artwork rather than a generic generated medal.
- Country Crush, Zilly and Lakeshore Farms logos are rendered directly against the blue header without the white logo box.
- The Tasting Room page now shows the current menu first. The full catalog is hidden behind **Add / change**, and a menu can be pasted or uploaded as TXT/CSV/Markdown/HTML to auto-select matching Commerce7 wines.
- Printed tasting-room cards use the website/Commerce7 description and include blank staff-note lines for handwritten notes.


## v4 layout updates

- Official San Francisco Chronicle badge PNGs from the supplied 2023–2026 award packages are bundled under `public/awards/` and used directly on profiles and tech sheets.
- Tech-sheet award badges no longer crop a larger website image. The clean badge asset is placed in its own right-side visual area so it does not cover tasting-note text.
- The bottle-size control now runs from `0.50×` to `4.00×` and still starts at `2.20×`, allowing narrow bottle images to scale all the way to the top of the page.
- When Case Packaging is enabled, the copy column moves upward and uses tighter section spacing. Packaging artwork can display up to roughly 320 × 155 px.
- Wine Library bottle cards now use a padded `object-contain` image treatment rather than enlarging/cropping the Commerce7 image.
- The Tasting Room printable guide now centers on **Sales Highlights** instead of the overview/short description, while keeping handwritten Staff Notes space.
