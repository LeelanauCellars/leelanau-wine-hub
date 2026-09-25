# Leelanau Cellars Central v58

## Ask Central deployment fix

- Fixed the TypeScript production-build error in `app/api/ask-central/route.ts` where `GEMINI_API_KEY` was still inferred as `string | undefined` inside the nested Gemini request helper.
- The environment variable is still checked at runtime before any Gemini request is made.
- After that check, the verified key is copied to a concrete `string` constant used by the request headers.
- No Ask Central behavior changed: v57 retry/fallback logic remains intact.
