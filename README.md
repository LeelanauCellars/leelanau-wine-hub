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

## Temporary highlight mapping

Until dedicated Wine Hub highlights are entered, the Commerce7 long product description is split into paragraph-level highlights for the tech sheet. A saved `tech_highlights` field always overrides that fallback.
