# Central v57

## Ask Central reliability
- Added automatic retries for temporary Gemini demand/rate-limit errors.
- Primary model remains `gemini-3.5-flash` by default.
- Added automatic fallback to `gemini-3.1-flash-lite` when the primary model stays unavailable after retries.
- Primary gets up to 3 attempts with short exponential backoff; fallback gets up to 2 attempts.
- Authentication/configuration errors do not waste time retrying.
- Staff now get a simple "Ask Central is busy right now" message only if both models fail.
- Successful API responses report which model actually answered and whether fallback was used (server response metadata; no UI clutter).
- Added optional `ASK_CENTRAL_GEMINI_FALLBACK_MODEL` environment override.
