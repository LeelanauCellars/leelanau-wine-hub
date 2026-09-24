# v41 — Collection-first Wine Library + Distribution navigation

- Adds a **Collections** landing step to both **Wine Library** and **Distribution Wines**, so users choose a brand/collection before scrolling product cards.
- Uses the nine current Leelanau collection groups: **Country Crush, Farm Fresh, Lakeshore Farms, Lakeshore Collection, Estate, Leelanau Cellars, Zilly, Witches Brew, and Seasonal Series**.
- Collection boxes show the current wine/product count and use existing approved case/package artwork when available.
- Global search remains available from the Collections screen. A search can find a wine across all collections without opening a collection first.
- Once a Wine Library collection is open, the existing wine-style/category filters remain available as a second navigation level.
- Once a Distribution collection is open, the existing distribution family labels remain available as a second filter when a collection contains multiple product families.
- Wine cards and Distribution cards now show their collection name for easier orientation.
- Adds the resolved collection to the Wine Profile “At a glance” section.
- Commerce7 sync now reads each Wine product's `vendorId` and resolves the assigned Commerce7 **Vendor** as the preferred collection/brand source of truth.
- If Commerce7 Vendor read access is not available, Central falls back to the product's Commerce7 Collections, existing brand information, product name, and distribution-family mappings instead of failing the Wine sync.
- The Commerce7 app/integration should have **Vendor: Read** permission enabled for exact vendor-driven collection grouping.
