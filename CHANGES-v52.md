# v52 — Tasting Menu PDF reliability fix

- Fixed the Vercel/serverless PDF parsing setup used by the automatic Notes matcher.
- `pdf-parse` now initializes its worker/canvas support in server-only dynamic imports.
- Added `@napi-rs/canvas` and Next.js `serverExternalPackages` configuration recommended for serverless PDF parsing.
- Marked the tasting-menu API as a Node.js, force-dynamic route.
- Current Blob-hosted tasting menus now use Vercel Blob's native public view/download URLs, so PDF viewing/downloading is independent of Notes text parsing.
- Added defensive API-response parsing so a server HTML error page no longer surfaces as `Unexpected token '<' ... is not valid JSON`.
