
## v6 updates

- Removed the Wine Library “complete” counter.
- Tech-sheet footer/contact line is editable per document while keeping the standard Leelanau Cellars contact information as the default.
- Rebuilt the Tasting Room staff guide as fixed landscape Letter pages with 12 wines per page, three columns, category labels, sales highlights, awards, and larger handwritten note lines.
- The tasting guide remains sorted by Red, White, Rosé, Sparkling, Fruit & Sweet, Dessert, Seasonal / Specialty, then Other.

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

## v7 updates

- Rebuilt the Tasting Room print guide as a cleaner two-column landscape field guide (10 wines/page) with no card-grid look.
- Removed the retired Leelanau Cellars Pinot Grigio 2023 from the current Commerce7 Wine Hub feed and demo data.
- Tightened website-award matching so a 2023 award does not attach to a 2022 wine with the same base name.
- Added approved case-packaging artwork under `public/cases/` and automatic wine-to-case matching in the Tech Sheet Builder.
- Case Packaging still supports a per-document URL/upload override when sales needs a different image.

### Automatic case packaging rules

- Autumn Harvest / Spring Splendor / Summer Sunset / Red Sangria / White Sangria → shared Leelanau seasonal/sangria case
- Summer Sunset Bubbly → Summer Sunset Bubbly case
- Winter White → Winter White case
- Winter White Bubbly → Winter White Bubbly case
- Great Lakes Red → Great Lakes Red case
- Great Lakes Red Bubbly → Great Lakes Red Bubbly case
- Witches Brew variants → Witches Brew case
- Festivus → Festivus case
- Farm Fresh Bubbly/Sparkling Moscato → Farm Fresh Bubbly Moscato case
- Other Farm Fresh wines → Farm Fresh Fruit Wine & Moscato case
- Country Crush wines → Country Crush case
- Lakeshore Farms Bubbly/Sparkling Moscato → Lakeshore Farms Sparkling Moscato case
- Other Lakeshore Farms wines → Lakeshore Farms Fruit & Moscato case
- Zilly wines → Zilly case
- Products/collections containing “Lakeshore Collection” → Lakeshore Collection case
- Products/collections containing “Chill” → Chill Wine case

## v10 updates

- Tech Sheet Builder keeps tasting notes blank by default, but **Use short Commerce7 tasting notes** now condenses flavor-focused Commerce7 copy into a concise note intended to fit roughly 2–3 lines on the sheet.
- Wine profiles now read the full Commerce7 product photo gallery (`images[]`), not only the primary `image` field.
- The Assets tab exposes primary/front, back (second Commerce7 product photo when present), and additional product images.
- Every bottle asset can be downloaded as either PNG or JPEG directly from Wine Hub.
- No Wine Specs behavior was changed.

## Lifestyle image assets

Wine profile Asset pages now include a dedicated **Wine Lifestyle Images** section. The approved photography supplied in `Wine Lifestyle Images for Hub.zip` is bundled under `public/lifestyle/` and matched automatically to the correct Commerce7 wine by wine name, brand, and collection. Lifestyle assets can be opened full-size or downloaded as PNG/JPEG from the Wine Hub.

## v12 updates

- Approved case-packaging artwork is now exposed directly on each wine's **Assets** tab when a case is associated with that wine. The case can be downloaded as PNG or JPEG and uses the same automatic mapping as the Tech Sheet Builder.
- Wine Hub now creates downloadable **UPC-A barcode artwork** from the UPC stored in Commerce7. Each valid UPC can be downloaded as SVG, PNG, or JPEG from the wine's Assets tab.
- 11-digit UPC values receive a calculated UPC-A check digit for artwork generation. Existing 12-digit Commerce7 UPCs are validated before a barcode is created; Wine Hub does not silently alter an invalid 12-digit UPC.
- The main Asset Library now indicates when a wine has case packaging and/or a valid downloadable UPC in addition to bottle and lifestyle images.

## v13 update
- Tech Sheet Builder now includes optional **Cost (Distributor)** and **Cost (Retailer)** fields, with Distributor shown first.
- Both start blank and appear on the finished tech sheet only when filled in.
- On the tech sheet, they appear between UPC and SRP.

## v15 lifestyle asset update

The second supplied Wine Lifestyle Images ZIP is now included in `public/lifestyle` and mapped through `lib/lifestyle-assets.ts`. Product-specific images attach to the matching wine; named group/family photos attach to the corresponding brand/flavor group.

## v18 tech-sheet formatting and display update

- Tasting Notes and Highlights include formatting controls for **bold**, underline, and highlighted text. In v19 these controls work directly in the rich-text editor, so formatting is visible while editing without marker characters.
- Tech sheets now support an optional **Display** merchandising image. When Case Packaging is present, Display appears beside it. When there is no Case Packaging, Display slides into the left-side packaging area by itself.
- Display images can be supplied by URL or uploaded directly for the current tech sheet and remain document-only overrides.

## v19 tech-sheet workflow update

- Tasting Notes and Highlights now populate automatically whenever a wine is opened in the Tech Sheet Builder or included in a batch. The Commerce7 buttons remain as refresh controls.
- Bold, underline, and highlight formatting is now applied directly inside a rich-text editor, so sales staff no longer see marker characters such as `**`, `__`, or `==` while editing.
- The left-side Tech Sheet Builder is no longer limited to a viewport-height nested scroll area; it continues naturally down the page.
- Bottle images start higher on the finished sheet by default and now include a vertical-position slider in addition to the size slider.
- The printable tech-sheet layout uses tighter spacing and copy sizing when notes, highlights, Case Packaging, or Display artwork need additional room, keeping the standard automatically generated content on one letter-size page.
- Wine Library now includes a **Select tech sheets** workflow for choosing multiple wines and printing/saving them together as one multi-page PDF. Batch sheets use the same automatic notes, highlights, awards, case packaging, bottle positioning, and header-color matching as individual sheets.
