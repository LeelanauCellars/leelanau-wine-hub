# Leelanau Cellars Central — v55

## Ask Central
- Added a new **Ask Central** section to every portal.
- Uses Vercel AI Gateway through the AI SDK, defaulting to `openai/gpt-5.6-luna`.
- On Vercel, AI Gateway can use the deployment's OIDC authentication; an `AI_GATEWAY_API_KEY` is only an optional local-development fallback.
- `ASK_CENTRAL_MODEL` can override the Gateway model without changing application code.
- Answers are grounded only in Central data supplied to the model. The system prompt explicitly tells the model not to use general or web knowledge and to say when Central does not contain an answer.
- Answers include source IDs and clickable source cards that open the corresponding Wine Library record, Tech Sheet, Distribution Wine, Quick Facts, Tasting Menu, or Case Sales Tracker.

## Retrieval and access
- Wine Library questions search the current Commerce7-synced wine records already loaded in Central.
- Distribution questions search the current Distribution Wines catalog, including UPC, GTIN, composition, pricing, and unit/case dimensions and weight.
- Tasting-menu questions use the latest menu text from Vercel Blob when available.
- Case-sales questions use the latest refund-adjusted Case Sales Tracker summary.
- Quick Facts questions use the internal winery/vineyard/vintage reference data.
- Portal permissions restrict which source families are supplied to Ask Central:
  - Tasting Room: Wine Library, current tasting menu, Quick Facts, Case Sales.
  - Sales: Wine Library, Distribution Wines, Tech Sheet links, Awards/Quick Facts.
  - Distributors: Distribution Wines only.
  - Admin: all Central sources.

## Interface
- Added suggested questions tailored to each portal.
- Enter sends a question; Shift+Enter creates a new line.
- Recent conversation context is included for follow-up questions.
- The UI shows a clear "Central sources only" status and keeps source links under each answer.
