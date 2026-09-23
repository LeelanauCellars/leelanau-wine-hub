# Wine Hub v29 — Merch/Apparel DYMO labels

- Added Tasting Room Merch/Apparel navigation without creating a separate app.
- Tasting Room portal now labels the existing Wine Library as Wines and adds Merch/Apparel.
- Admin also has access to Merch/Apparel; Sales and Distributors do not.
- Added a server-side Commerce7 merchandise endpoint using the existing Commerce7 credentials/session model.
- Merchandise pulls product image/name plus variant title, SKU, exact `upcCode`, price, inventory when present, and internal IDs.
- Added search and category filters for Apparel, Hoodies, Shirts, Hats, Glassware, Accessories, and Other.
- Added per-variant Ready/Missing UPC/Missing Price/Missing SKU/Duplicate UPC warnings.
- UPCs are never recalculated or check-digit validated. Exact Commerce7 values are encoded with Code 128.
- Added DYMO 30334 individual label printing at exactly 2.25in × 1.25in.
- Added a label queue with quantities and batch printing (one physical label page per quantity).
- Added Admin issue-count filters for missing UPC, missing price, missing SKU, and duplicate UPC.
- Added Save Label PDF secondary workflow through the same exact-size browser print layout.
- No Commerce7 write-back / UPC generation was added; the endpoint is read-only and future-ready for an admin-only write workflow later.
