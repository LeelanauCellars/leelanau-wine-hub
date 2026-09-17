import type { WineRecord } from './types';

const now = '2026-09-17T00:00:00.000Z';

export const SEED_WINES: WineRecord[] = [
  {
    id: 'cold-duck',
    source: 'demo',
    name: 'Cold Duck',
    vintage: 'NV',
    brand: 'Leelanau Cellars',
    category: 'Sparkling Red',
    collection: 'Leelanau Cellars',
    status: 'Available',
    varietal: 'Red Blend',
    appellation: 'Michigan',
    bottleImage: '/cold-duck-composite.png',
    price: 10.99,
    upc: '0-84970-02126-5',
    volumeMl: 750,
    abv: '12%',
    casePack: '12 × 750 mL bottles',
    sweetness: 'Sweet',
    tastingNotes: 'Our Cold Duck is a sweet, light-bodied red sparkling wine with lively notes of ripe fruit. A nod to the iconic Detroit wine of the 1960s–70s that’s fun and made for celebrating.',
    shortDescription: 'Sweet, light-bodied red bubbly with ripe-fruit character. Serve chilled.',
    staffPitch: 'A fun, approachable sparkling red for customers who like sweeter wines or want something celebratory. Serve it cold.',
    pairings: 'Celebrations, party snacks, barbecue, pizza and casual gatherings.',
    highlights: [
      'Sweet red bubbly served chilled',
      'A modern spin on a legendary favorite, bringing an iconic Detroit sparkling red to a new generation.',
      'Fun, smiling cartoon duck on the label that pops on the shelf and starts a conversation.',
      'Crafted for those who want a sweet, social, and eye-catching sparkler.',
      'Won Gold in the 2026 San Francisco Chronicle Wine Competition',
    ],
    awards: [{ id: 'cold-duck-sfcwc-2026', year: 2026, competition: 'San Francisco Chronicle Wine Competition', result: 'Gold', graphicUrl: '/sfcwc-gold-2026.png' }],
    onTastingMenu: true, updatedAt: now,
  },
  {
    id: 'cherries-galore', source: 'demo', name: 'Cherries Galore', vintage: 'NV', brand: 'Leelanau Cellars', category: 'Sparkling', status: 'Available',
    varietal: 'Cherry Wine', appellation: 'Michigan', sweetness: 'Sweet', tastingNotes: 'Bright cherry flavor with an easygoing sparkling finish.', shortDescription: 'Festive cherry-forward bubbly made for celebrations.',
    staffPitch: 'Lead with the cherry flavor and celebratory style. It is an easy recommendation for guests looking for something distinctly Michigan.', pairings: 'Celebrations, chocolate desserts and casual sipping.',
    highlights: ['Official wine of the CherryT Ball Drop', 'Double Gold — 2026 San Francisco Chronicle Wine Competition'],
    awards: [{ id: 'cg-2026', year: 2026, competition: 'San Francisco Chronicle Wine Competition', result: 'Double Gold' }], onTastingMenu: true, updatedAt: now,
  },
  {
    id: 'pinot-grigio-2023', source: 'demo', name: 'Pinot Grigio', vintage: '2023', brand: 'Leelanau Cellars', category: 'White', status: 'Available',
    varietal: 'Pinot Grigio', appellation: 'Leelanau Peninsula', sweetness: 'Dry', tastingNotes: 'A crisp, refreshing white with bright fruit character and a clean finish.',
    shortDescription: 'Crisp, bright and refreshing.', staffPitch: 'A comfortable first pour for guests looking for a familiar dry white.', pairings: 'Seafood, salads, light pasta and summer dishes.',
    highlights: ['Bronze — 2026 San Francisco Chronicle Wine Competition'], awards: [{ id: 'pg-2026', year: 2026, competition: 'San Francisco Chronicle Wine Competition', result: 'Bronze' }], onTastingMenu: true, updatedAt: now,
  },
  {
    id: 'limited-batch-riesling-2024', source: 'demo', name: 'Limited Batch Riesling', vintage: '2024', brand: 'Leelanau Cellars', category: 'White', status: 'Available',
    varietal: 'Riesling', appellation: 'Leelanau Peninsula', sweetness: 'Semi-Dry', tastingNotes: 'Fresh fruit character, lively acidity and an easy, balanced finish.',
    shortDescription: 'Bright Riesling with fruit, freshness and balance.', staffPitch: 'Good for guests who want Riesling with fruit but do not want something heavily sweet.', pairings: 'Spicy food, pork, poultry and soft cheeses.', highlights: [], awards: [], onTastingMenu: true, updatedAt: now,
  },
  {
    id: 'sauvignon-blanc-2025', source: 'demo', name: 'Sauvignon Blanc', vintage: '2025', brand: 'Leelanau Cellars', category: 'White', status: 'Available',
    varietal: 'Sauvignon Blanc', appellation: 'Leelanau Peninsula', sweetness: 'Dry', tastingNotes: 'A clean, energetic white built around bright acidity and fresh fruit.',
    shortDescription: 'Fresh, dry and bright.', staffPitch: 'Point dry-white drinkers here when they want something lively and refreshing.', pairings: 'Goat cheese, seafood, salads and fresh vegetables.', highlights: [], awards: [], onTastingMenu: true, updatedAt: now,
  },
  {
    id: 'baco-noir-2021', source: 'demo', name: 'Baco Noir', vintage: '2021', brand: 'Leelanau Cellars', category: 'Red', status: 'Available',
    varietal: 'Baco Noir', appellation: 'Leelanau Peninsula', sweetness: 'Dry', tastingNotes: 'Dark-fruited, smooth and distinctly northern Michigan.',
    shortDescription: 'Smooth local red with dark-fruit character.', staffPitch: 'A useful bridge for guests who want a local red with personality but not a huge, heavy style.', pairings: 'Burgers, barbecue, pizza and roasted meats.', highlights: [], awards: [], onTastingMenu: true, updatedAt: now,
  },
  {
    id: 'merlot-2023', source: 'demo', name: 'Merlot', vintage: '2023', brand: 'Leelanau Cellars', category: 'Red', status: 'Available',
    varietal: 'Merlot', appellation: 'Leelanau Peninsula', sweetness: 'Dry', tastingNotes: 'A smooth red with dark-fruit notes and an approachable finish.',
    shortDescription: 'Smooth, dark-fruited and approachable.', staffPitch: 'A familiar dry-red option for guests who want something softer than a big Cabernet.', pairings: 'Beef, mushrooms, tomato-based dishes and aged cheese.',
    highlights: ['Silver — San Francisco Chronicle Wine Competition'], awards: [{ id: 'merlot-sfcwc', year: 2025, competition: 'San Francisco Chronicle Wine Competition', result: 'Silver' }], updatedAt: now,
  },
  {
    id: 'witches-brew', source: 'demo', name: 'Witches Brew', vintage: 'NV', brand: 'Leelanau Cellars', category: 'Seasonal', status: 'Available',
    varietal: 'Spiced Red Wine', appellation: 'Michigan', sweetness: 'Sweet', tastingNotes: 'A warming seasonal red with sweet spice character.',
    shortDescription: 'Sweet, spiced and unmistakably fall.', staffPitch: 'The easy seasonal recommendation: serve warm or chilled depending on the occasion.', pairings: 'Fall gatherings, desserts and cozy-weather sipping.',
    highlights: ['Silver — 2026 San Francisco Chronicle Wine Competition'], awards: [{ id: 'wb-2026', year: 2026, competition: 'San Francisco Chronicle Wine Competition', result: 'Silver' }], updatedAt: now,
  },
  {
    id: 'blanc-de-noir-2024', source: 'demo', name: 'Blanc de Noir', vintage: '2024', brand: 'Leelanau Cellars', category: 'White', status: 'Available',
    varietal: 'Blanc de Noir', appellation: 'Leelanau Peninsula', sweetness: 'Dry', tastingNotes: 'Light, fresh and food-friendly with a clean finish.',
    shortDescription: 'Fresh, light and versatile.', staffPitch: 'A good conversation wine for guests looking to try something a little different while staying in a dry style.', pairings: 'Charcuterie, fish, poultry and lighter fare.',
    highlights: ['Silver — 2026 San Francisco Chronicle Wine Competition'], awards: [{ id: 'bdn-2026', year: 2026, competition: 'San Francisco Chronicle Wine Competition', result: 'Silver' }], updatedAt: now,
  },
];
