# Leelanau Cellars Central v37

- Replaced the first entry screen with a white logo and blue Enter button based on the supplied reference.
- Replaced the area chooser with the Central welcome heading, four supplied photo cards and blue actions. Existing role destinations and permissions remain intact.
- Updated the main sidebar with a larger square logo and blue uppercase navigation tabs, including a visible active state and scrolling on shorter displays.
- Updated the browser title and mobile header to Leelanau Cellars Central.
- Fixed the TypeScript error in Merch/Apparel batch printing by removing the redundant `dymoStatus === 'printing'` comparison. The direct DYMO 30334 template and responsive merch row fixes remain included.
- `npm run build` completed successfully with Next.js 16.1.1 and TypeScript. Physical DYMO output and visual browser rendering require local checks.
