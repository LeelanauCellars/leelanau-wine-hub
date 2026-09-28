# v63

- Ask Central now uses Gemini 3.5 Flash-Lite as the primary model.
- Gemini 3.1 Flash-Lite remains the automatic backup.
- Uses minimal thinking for faster simple staff questions.
- If Gemini is overloaded, rate-limited, or times out, Ask Central now returns a useful answer directly from Central's retrieved records instead of showing a red dead-end error.
- Direct fallback supports winery history/vintages/vineyards, case-sales status, wine details, distribution specs, and tasting-menu matches.
- Authentication/key errors still surface normally so configuration problems are not hidden.
