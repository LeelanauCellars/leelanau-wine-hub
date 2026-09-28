# v66

## Ask Central first-turn reliability
- Added intent routing before retrieval so the first question is sent to the right Central source instead of letting generic wine matches win.
- New intents: Merch/Apparel, Case Sales, Current Tasting Menu, Distribution Specs, Quick Facts, and Wine Library.
- Merch/Apparel label-printing questions now route to the Merch/Apparel workflow instead of a wine record. Sales/Distributor users are told that label printing lives in the Admin/Tasting Room portal.
- Broad tasting-room questions such as “What are we currently selling in the tasting room?” now answer directly from the current tasting-menu source instead of selecting a random wine.
- Case-sales questions now answer directly from the live Case Sales Tracker without waiting for Gemini.
- Broad current-menu and operational questions use deterministic Central data first for faster, more reliable answers.
- Independent new questions no longer automatically inherit the previous topic. Conversation history is used for short follow-ups such as “What about the price?” or a one-word follow-up.
- Gemini prompts now include the detected intent and explicitly prohibit answering an operational question with an unrelated wine record.
- Source lists are tighter and intent-specific, reducing irrelevant “Sources (10)” results.
