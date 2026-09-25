# v49 — Vintage-free permanent wine URLs

Built from v48.

- Wine Library and Tech Sheet permalinks now represent the wine itself rather than a specific vintage.
- Standalone four-digit vintage years are removed from Commerce7 product slugs, local wine IDs, and fallback wine names when Central builds a permanent wine URL.
- Example canonical URLs now use `/wine-library/baco-noir` and `/tech-sheets/baco-noir` instead of ending in `-2021`.
- Existing v48 links that include a vintage continue to resolve. Once opened, Central replaces them in the browser with the new vintage-free canonical URL.
- If more than one record for the same wine is present, the permanent URL prefers an Available record, then the newest numeric vintage, then the most recently updated record. This lets a shared link follow the current vintage over time.
- Distribution Wine URLs are unchanged because those records can represent package-specific products rather than one persistent wine identity.
