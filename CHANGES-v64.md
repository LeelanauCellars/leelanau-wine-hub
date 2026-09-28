# v64

- Fixed Ask Central's direct fallback choosing the wrong distribution wine for normal wine questions.
- General wine questions now prefer the best Wine Library match; distribution records only take priority for explicit GTIN/UPC/spec/package/dimension/weight/distribution questions.
- A year in a wine question no longer causes general vintage Quick Facts to override a matching wine record.
- Removed the visible “Gemini is busy” wording from successful Central-direct fallback answers so fallback feels like a normal answer.
- Example fixed: “What do you know about the 2021 Baco?” now falls back to the Baco Noir 2021 Wine Library record rather than an unrelated distribution item.
