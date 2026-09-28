# Central v59

## Faster Ask Central

- Uses `gemini-3.1-flash-lite` as the default first model for quicker internal Q&A.
- Falls back immediately to `gemini-3.5-flash` when Flash-Lite is overloaded, rate-limited, unavailable, or too slow.
- Removes the multi-attempt exponential retry chain that could make a single question feel very slow.
- Adds a 7-second primary-model timeout and 9-second fallback timeout.
- Limits the Gemini prompt to the most relevant Central sources while always preserving matching operational sources such as Case Sales, the current Tasting Menu, and Quick Facts.
- Reduces the maximum answer budget from 1,000 to 600 output tokens because Ask Central is designed for concise staff answers.
- Keeps portal permissions, Central-only grounding, source links, and the existing Gemini API key setup unchanged.
