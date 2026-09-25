# Central v50

- Replaced the custom Vercel Blob REST implementation with the official `@vercel/blob` SDK.
- Uses the Blob store connected to the Vercel project, including current OIDC-based authentication.
- Tasting Menu storage availability is now determined by an actual Blob `list()` request instead of checking legacy environment-variable names.
- Admin menu replacement uploads through `put()` to `tasting-room/menu-<timestamp>.pdf`.
- Keeps the bundled menu as a fallback if Blob is temporarily unavailable.
