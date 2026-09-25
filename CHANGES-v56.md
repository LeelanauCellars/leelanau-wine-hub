# Central v56

## Ask Central — direct Gemini API
- Replaced Vercel AI Gateway with direct Google Gemini API requests.
- Ask Central now reads the server-side `GEMINI_API_KEY` already configured in Vercel.
- Default model is `gemini-3.5-flash`; override with `ASK_CENTRAL_GEMINI_MODEL` if desired.
- Removed the Vercel AI SDK dependency because Ask Central no longer routes through AI Gateway.
- Keeps the existing Central-only retrieval, portal permissions, source links, and follow-up context.
- Added clearer errors for missing API keys, invalid credentials, Gemini rate limits, and unreadable API responses.
- The Gemini key is never sent to the browser; calls happen only from the server-side Ask Central route.
