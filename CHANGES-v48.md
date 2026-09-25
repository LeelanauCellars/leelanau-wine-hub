# v48 — Direct links / permanent Central URLs

Built from v46 (the wine-pour transition from the discarded v47 is not included).

- Added real, shareable browser URLs for Wine Library records, profile tabs, tech sheets, Distribution Wine records, and primary Central sections.
- Added browser Back/Forward support using the History API.
- Added a catch-all Next.js route so a copied Central URL can be opened/refreshed directly instead of returning a 404.
- Commerce7 product slugs are now retained as the preferred permanent wine permalink when available; existing readable local wine IDs remain the fallback.
- Added **Copy wine link**, **Copy tech sheet link**, and **Copy product link** actions.
- Direct links retain their destination through the existing PIN / welcome flow and then open the appropriate portal automatically.
- Legacy `?productId=` links are upgraded to the readable Wine Library permalink.
- Standardized website references to the canonical `https://lwc.wine` domain.
- Added `NEXT_PUBLIC_CENTRAL_PATH_PREFIX` support for a future `/central` deployment under `lwc.wine`.

Example future URLs when mounted at `https://lwc.wine/central`:

- `https://lwc.wine/central/wine-library/baco-noir-2021`
- `https://lwc.wine/central/wine-library/baco-noir-2021/specs`
- `https://lwc.wine/central/tech-sheets/baco-noir-2021`
- `https://lwc.wine/central/distribution-wines/<product-slug>`
