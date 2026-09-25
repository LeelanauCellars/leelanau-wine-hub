# Leelanau Cellars Central v47

- Added a fast red-wine pour transition between the opening ENTER screen and the portal selector.
- The wine stream pours from the top while a dark red liquid surface rises from the bottom to fill the viewport.
- The portal selector is swapped in while the screen is covered, then the wine fades away to reveal it.
- Total transition time is about 0.8 seconds so it stays playful without slowing navigation.
- Respects `prefers-reduced-motion` and skips the animation for users who request reduced motion.
