# Leelanau Cellars Central v61

## Ask Central polish + reliability

- Renders Gemini's `**bold**` formatting instead of showing raw asterisks.
- Converts inline `[S1]` citations into compact numbered Central source badges; tapping a badge opens that source.
- Keeps the full source list collapsed behind the existing Sources control and displays friendly source numbers instead of raw `S1` labels.
- Changes staff/user question bubbles to the Leelanau Central blue and keeps the Ask button on the same blue.
- Prevents rapid double-submit requests so one question cannot accidentally appear twice.
- Adds a 15-second browser request guard so a stalled request does not spin forever.
- Reduces conversation history and source payload sent to Gemini, caps answers at 450 output tokens, and uses shorter primary/fallback model timeouts for faster responses.
- Tells Gemini to prefer concise short paragraphs or 3–6 bullets.
