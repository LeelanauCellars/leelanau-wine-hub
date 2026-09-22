export const CURRENT_TASTING_MENU_VERSION = '2026-09-22';
export const CURRENT_TASTING_MENU_LABEL = 'Current Menu · September 2026';

export const CURRENT_TASTING_MENU_TEXT = `
2023 chardonnay
2023 pleasant hill pinot grigio
2022 pinot grigio
2024 brüt sur lie
2024 gewürz bubbly
2024 brüt
2025 sauvignon blanc
2024 gewürztraminer
2023 limited batch pinot grigio
2022 dry riesling
2024 limited batch riesling
2024 renaissance
2022 meritage
2023 limited release meritage
2023 merlot
2023 limited release merlot
2022 baco noir: the end
2023 pinot noir
2021 baco noir
2024 nouveau
2023 rosé
2023 limited batch rosé
2024 rosé bubbly
summer sunset
2024 cuvée blanc
2022 semi-dry riesling
2022 semi-dry bubbly
spring splendor
2022 vignoles
2024 sweet pinot grigio
white sangria
2024 late harvest gewürztraminer
2022 late harvest riesling
winter white
red sangria
2022 sweet baco noir
great lakes red
cold duck
cherries galore
farm fresh raspberry bubbly
farm fresh peach bubbly
farm fresh blackberry bubbly
cherry cordial
chocolate cherry dessert
cherry dessert wine
raspberry dessert wine
2020 vintage port
`;

export const QUICK_FACTS = {
  story: {
    title: 'Our Story',
    bullets: [
      'Founded in 1974 by the Jacobson family and Charles Kalchik when they planted their first vines at their Leelanau County cherry orchard, making Leelanau Cellars one of the oldest wineries in northern Michigan.',
      'Still family-owned by the Jacobson family today, with Bob Jacobson owning the winery as President and CEO. His father, Mike, founded Leelanau Cellars.',
      'Leelanau Cellars distributes more than 300,000 cases to 43 states every year and is the largest distributor of wine in Michigan and the No. 2 distributor in the Midwest.',
      'The majority of estate wines have had a vintage earn an award in the San Francisco Chronicle Wine Competition.',
    ],
    brands: [
      ['Witches Brew', 'Started in 1997. Distributed in 44 states. Spiced Apple and Pumpkin Spice later joined the brand, which has also been featured on the Today Show.'],
      ['Winter White', 'Started in 1986. Recognized for its blue bottle and described in the staff document as the No. 1 white wine in the region. Also available in bubbly.'],
      ['Chill', 'Originally offered as Winter White Chills; now called Chill, with four flavors.'],
      ['Great Lakes Red', 'Started in 2003. Best-selling Concord grape wine in Michigan; the staff shorthand is “boozy grape juice.”'],
      ['Farm Fresh', 'Started in 2019 as a fruit wine brand. Fruit Moscatos were added in 2020 and Fruit Bubbly Moscatos in 2021.'],
      ['Other retail brands', 'Country Crush, Lakeshore Farms, Seasonal Series, Red Sangria, White Sangria, Sweet Red, Sleeping Bear Red and the four-wine Lakeshore Collection.'],
    ] as Array<[string, string]>,
  },
  region: {
    title: 'About the Region: Traverse City Wine Country',
    bullets: [
      'Cool-climate, maritime region influenced by Lake Michigan.',
      'Short growing season with spring and fall frost risk.',
      'Well-drained sandy loam soils that are well suited to viticulture.',
      'Lake Michigan buffers temperature, leading to cooler summer days and warmer winters.',
      'Snow cover helps insulate vines in winter and can aid survival of cold-tender varieties.',
    ],
  },
  growing: {
    title: 'Growing Conditions',
    bullets: [
      'Growing Degree Days (GDD) range from 1,500 to 2,400, averaging about 2,000.',
      'Rainfall is generally sufficient, so irrigation is not needed.',
      'Cool fall temperatures contribute to complex flavors, especially in white wines.',
      'Frost and winterkill can affect yields and vine health.',
      'Canopy management, cover crops and compost are used to promote soil and vine health.',
    ],
  },
  vineyards: [
    { site: 'Omena', features: 'Elevated, forest-sheltered, sandy loam, southern aspect', vineyards: '17' },
    { site: 'M204', features: 'Hilly, open, windy, excellent air and moisture drainage', vineyards: '18' },
    { site: 'Pleasant Hill', features: 'Warm afternoon sun, heavier soil in places', vineyards: '7' },
    { site: 'Hilltop', features: 'Winery site, even terrain, rich silt soils on north side', vineyards: '1 (trial)' },
  ],
  vineyardNote: 'The staff document lists 68.5 total vineyard acres. A vineyard is defined as a set of vines distinct from others by planting time, variety/rootstock, or location within a site.',
  varieties: [
    { variety: 'Chardonnay', type: 'White (Vinifera)', acreage: '3.9 acres', locations: 'Omena (2 vineyards)', notes: 'Cold-hardy, mid-season ripener' },
    { variety: 'Gewürztraminer', type: 'White (Vinifera)', acreage: '2.5 acres', locations: 'M204 (2 vineyards)', notes: 'Floral, spicy, aromatic, early ripening' },
    { variety: 'Pinot Gris', type: 'White (Vinifera)', acreage: '21.8 acres', locations: 'Omena (4.0), M204 (7.8), Pleasant Hill (10.0)', notes: 'Early ripener, tight clusters, must be carefully managed' },
    { variety: 'Riesling', type: 'White (Vinifera)', acreage: '16.5 acres', locations: 'Omena (4.7), M204 (11.8)', notes: 'Cold-hardy, late-season harvest, tight clusters' },
    { variety: 'Sauvignon Blanc', type: 'White (Vinifera)', acreage: '0.7 acres', locations: 'M204', notes: 'Cold-tender, early ripener, bright flavors' },
    { variety: 'Cabernet Franc', type: 'Red (Vinifera)', acreage: '1.1 acres', locations: 'Omena', notes: 'Cold-hardy red, structured and tannic' },
    { variety: 'Cabernet Sauvignon', type: 'Red (Vinifera)', acreage: '0.9 acres', locations: 'Omena', notes: 'Late ripener, less frost risk due to late bud break' },
    { variety: 'Merlot', type: 'Red (Vinifera)', acreage: '4.2 acres', locations: 'Omena (2.6), M204 (1.6)', notes: 'Mid-late ripener, Bordeaux variety' },
    { variety: 'Pinot Noir', type: 'Red (Vinifera)', acreage: '4.5 acres', locations: 'Omena (2.3), M204 (2.2)', notes: 'Early ripener, sometimes harvested for Rosé' },
    { variety: 'Vignoles', type: 'White (Hybrid)', acreage: '3.1 acres', locations: 'Omena', notes: 'Very cold-hardy, late bud break, can develop Noble Rot' },
    { variety: 'Baco Noir', type: 'Red (Hybrid)', acreage: '9.3 acres', locations: 'Omena (1.9), Pleasant Hill (7.4)', notes: 'First to ripen, rich in flavor and color' },
  ],
  trials: {
    white: 'Cayuga White, Frontenac Gris, La Crescent, Valvin Muscat, Traminette, Vignoles',
    red: 'Frontenac, Marquette',
    comingSoon: 'The oldest Baco Noir vineyard was removed in 2022, with that vintage named Baco Noir: The End. Sauvignon Blanc was planned for that Pleasant Hill site in spring 2026, with the first wine from the new planting expected around 2029.',
  },
  sustainability: [
    'Compost-based soil enrichment and cover cropping.',
    'Balanced pruning, sap flow pruning, shoot thinning, hedging and cluster thinning.',
    'Leaf pulling for airflow and sun exposure, reducing the need for chemicals.',
    'The objective is to reduce the need for synthetic chemicals.',
  ],
  vintages: [
    { year: '2019', bullets: ['Harsh winter (-14°F in March) caused severe winterkill.', 'Low yields due to crop loss and labor shortages.', 'Cold, wet growing season with low heat accumulation.'] },
    { year: '2020', bullets: ['Average heat and very wet conditions.', 'Yields slightly below average.', 'Early frost in late September triggered early leaf senescence, though not rapid.'] },
    { year: '2021', bullets: ['Warm and dry, excluding two major summer rainstorms.', 'Yields 7–10% below average.', 'Excellent sugars (20–24 °Brix) with slightly elevated acids.'] },
    { year: '2022', bullets: ['Average warmth and rainfall, except for a wet spring and late fall.', 'High yields with solid sugar development.', 'Slightly elevated acids contribute to good wine structure.'] },
    { year: '2023', bullets: ['High-quality yields with low winterkill.', 'The season started cool and warmed significantly late in the year.', 'Good ripeness with prominent fruit and acidity; wines expected to have strong flavor and structure.'] },
    { year: '2024', bullets: ['Mild winter with no crop loss.', 'High temperatures and early phenology stages.', 'Drought from August–October resulted in concentrated flavors and excellent quality, with high sugar and relatively low acidity.', 'Sauvignon Blanc 2024 received early leaf pulling before bloom to develop tropical fruit notes and was hand-harvested.'] },
  ],
};
