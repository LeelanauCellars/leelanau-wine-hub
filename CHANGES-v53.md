# Leelanau Cellars Central v53

## Case Sales Tracker
- Added a new **Case Sales Tracker** section for the Tasting Room and Admin portals.
- Staff can upload a Commerce7 order CSV and Central automatically groups **Bottle Quantity (column CK)** by **Order Number (column E)**.
- Case-equivalent logic uses complete 12-bottle groups per order: 12–23 bottles = 1 case, 24–35 = 2 cases, etc.
- When the Commerce7 `Channel` column is present, only **POS** orders are included so Web, Club and Inbound orders do not inflate tasting-room case sales.
- Refund/negative-only orders cannot create negative case sales.
- The dashboard shows cases sold, goal, cases remaining, required cases per day, progress, as-of date, remaining days, recent case-sales pace and report details.
- Admin can set the case goal and goal end date. Tasting Room and Admin can upload refreshed CSV reports.
- The latest goal carries forward when a new sales CSV is uploaded.
- For privacy, the source CSV is processed server-side but **not retained in Vercel Blob**. Only aggregate case-sales totals are saved.

## Sample validation
Using the supplied September Commerce7 export through September 24, the tracker calculates **233 tasting-room case equivalents across 192 case-sale orders** after filtering to POS orders.
