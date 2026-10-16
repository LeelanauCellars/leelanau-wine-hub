export type DistributionAsset = {
  label: string;
  url: string;
};

export type DistributionWine = {
  id: string;
  name: string;
  family: string;
  discontinued: boolean;
  sourceRow: number;
  iriDescription?: string | null;
  upcFull?: string | null;
  upc10?: string | null;
  gtin?: string | null;
  meijerPid?: string | null;
  targetDpci?: string | null;
  pricing: {
    miCase?: number | null;
    miBottle?: number | null;
    miSrp?: number | null;
    ohCase?: number | null;
    ohBottle?: number | null;
    ohSrp?: number | null;
  };
  specs: {
    size?: string | null;
    glassType?: string | null;
    rs?: string | number | null;
    abv?: string | number | null;
    ph?: string | number | null;
    ta?: string | number | null;
    composition?: string | null;
  };
  marketingCopy?: string | null;
  assets: DistributionAsset[];
  imperial: Record<string, string | number | null>;
  metric: Record<string, string | number | null>;
};

export const DISTRIBUTION_WINES: DistributionWine[] = [
  {
    "id": "witches-brew-spiced-red",
    "name": "Witches Brew Spiced Red",
    "family": "Witches Brew",
    "discontinued": false,
    "sourceRow": 4,
    "iriDescription": null,
    "upcFull": "0-84970-00161-8",
    "upc10": "8497000161",
    "gtin": "10084970001615",
    "meijerPid": "506632",
    "targetDpci": "213-00-5019",
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 6.4,
      "abv": 12,
      "ph": 0,
      "ta": 7.3,
      "composition": "Ruby Cabernet"
    },
    "marketingCopy": "A layered and aromatic celebration of traditional spices. Try our distinctive red blend warmed or devilishly hot.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "witches-brew-spiced-apple",
    "name": "Witches Brew Spiced Apple",
    "family": "Witches Brew",
    "discontinued": false,
    "sourceRow": 5,
    "iriDescription": null,
    "upcFull": "0-84970-00169-4",
    "upc10": "8497000169",
    "gtin": "10084970001691",
    "meijerPid": "4791162",
    "targetDpci": "213-00-5019",
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 2,
      "abv": 12,
      "ph": 0,
      "ta": 0,
      "composition": "Apple"
    },
    "marketingCopy": "Sweet, crisp apples. Cinnamon and brown sugar from the spice merchant. Enjoy chilled or serve warm like a steamy apple pie from Grandma's kitchen. Pairs perfectly with a cozy porch swing on a fall evening.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "witches-brew-pumpkin-spice",
    "name": "Witches Brew Pumpkin Spice",
    "family": "Witches Brew",
    "discontinued": false,
    "sourceRow": 6,
    "iriDescription": null,
    "upcFull": "0-84970-00179-3",
    "upc10": "8497000179",
    "gtin": "10084970001790",
    "meijerPid": "4935053",
    "targetDpci": "213-00-5018",
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 5.6,
      "abv": 10,
      "ph": 0,
      "ta": 0,
      "composition": "Apple"
    },
    "marketingCopy": "Pumpkin spice might just be the official beverage of Fall. With sweet, tangy, traditional Autumn spices, the aromas draw you into the glass with intoxicating notes of apple, ginger, and clove. Enjoy chilled or hot from your fave mug.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "zilly-sauvignon-blanc",
    "name": "Zilly Sauvignon Blanc",
    "family": "Zilly",
    "discontinued": false,
    "sourceRow": 8,
    "iriDescription": null,
    "upcFull": "0-84970-31736-8",
    "upc10": "8497031736",
    "gtin": "10084970317365",
    "meijerPid": "5413343",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Zilly/UPC%2024.02%20Zilly-Sauv%20Blanc%2031736-8.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "zilly-pinot-grigio",
    "name": "Zilly Pinot Grigio",
    "family": "Zilly",
    "discontinued": false,
    "sourceRow": 9,
    "iriDescription": null,
    "upcFull": "0-84970-31758-0",
    "upc10": "8497031758",
    "gtin": "10084970317587",
    "meijerPid": "5413341",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Zilly/UPC%2024.02%20Zilly-Pinot%20Grigio%2031758-0.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "zilly-chardonnay",
    "name": "Zilly Chardonnay",
    "family": "Zilly",
    "discontinued": false,
    "sourceRow": 10,
    "iriDescription": null,
    "upcFull": "0-84970-31722-1",
    "upc10": "8497031722",
    "gtin": "10084970317228",
    "meijerPid": "5413342",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Zilly"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "zilly-cabernet",
    "name": "Zilly Cabernet",
    "family": "Zilly",
    "discontinued": false,
    "sourceRow": 11,
    "iriDescription": null,
    "upcFull": "0-84970-31715-3",
    "upc10": "8497031715",
    "gtin": "10084970317150",
    "meijerPid": "5413340",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Zilly/UPC%2024.02%20Zilly-Cabernet%2031715-3.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-apple",
    "name": "Farm Fresh Apple",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 13,
    "iriDescription": null,
    "upcFull": "0-84970-01001-1",
    "upc10": "8497001001",
    "gtin": "10084970010013",
    "meijerPid": "4516614",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 2.3,
      "abv": 12,
      "ph": 3.75,
      "ta": 7,
      "composition": "Apple"
    },
    "marketingCopy": "Not cider. Hot hard apple juice. This apple wine delicately balances the quintessential apple flavors found in apple juice with alcohol content and adjusted acidity.  While cider and hard apple juice can be harsh or pungent, this apple wine is balanced, flavorful and fresh.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%208497001001%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%208497001001%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%208497001001%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%208497001001%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%208497001001%20LBL%20FR.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Apple/FF%20APL%208497001001%20LBL%20BK.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-blackberry",
    "name": "Farm Fresh Blackberry",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 14,
    "iriDescription": null,
    "upcFull": "0-84970-01002-3",
    "upc10": "8497001002",
    "gtin": "10084970010020",
    "meijerPid": "4516613",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 14.6,
      "abv": 12,
      "ph": 3.63,
      "ta": 10.2,
      "composition": "Blackberry"
    },
    "marketingCopy": "The nose is light, mellow and fruity with a hint of fresh picked ripe blackberries. Smooth, sweet, juicy ripe blackberry flavors abound. A pleasant crisp fruity flavor lingers on the tongue, reminiscent of blackberry cobbler made from scratch. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Spec%20Sheet.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Lifestyle%20Sheet%20PDF.pdf"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Label%20Front.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blackberry/FF%20BLK%208497001002%20Label%20Back.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-blueberry",
    "name": "Farm Fresh Blueberry",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 15,
    "iriDescription": null,
    "upcFull": "0-84970-01003-0",
    "upc10": "8497001003",
    "gtin": "10084970010037",
    "meijerPid": "4516612",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 6.9,
      "abv": 12,
      "ph": 3.23,
      "ta": 8,
      "composition": "Blueberry"
    },
    "marketingCopy": "Renowned for its delicately sweet taste that is neither watered down nor syru...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Spec%20Sheet.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Lifestyle%20Sheet%20PDF.pdf"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Label%20Front.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Blueberry/FF%20BLU%208497001003%20Label%20Back.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-cherry",
    "name": "Farm Fresh Cherry",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 16,
    "iriDescription": null,
    "upcFull": "0-84970-01004-7",
    "upc10": "8497001004",
    "gtin": "10084970010044",
    "meijerPid": "4516611",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 7.1,
      "abv": 12,
      "ph": 3.71,
      "ta": 12.5,
      "composition": "Cherry"
    },
    "marketingCopy": "Cherries are a favorite stone and summer fruit of Michigan natives. Dark like...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20Label%20Front.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cherry/FF%20CHR%208497001004%20Label%20Back.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-cranberry",
    "name": "Farm Fresh Cranberry",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 17,
    "iriDescription": null,
    "upcFull": "0-84970-01005-4",
    "upc10": "8497001005",
    "gtin": "10084970010051",
    "meijerPid": "4516610",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 20,
      "abv": 12,
      "ph": 2.69,
      "ta": 20,
      "composition": "Cranberry"
    },
    "marketingCopy": "Farm Fresh Cranberry delivers a delicious touch of sweetness on the front of ...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20Label%20Front.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Cranberry/FF%20CRN%208497001005%20Label%20Back.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-mango",
    "name": "Farm Fresh Mango",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 18,
    "iriDescription": null,
    "upcFull": "0-84970-01067-1",
    "upc10": "8497001067",
    "gtin": "10084970010679",
    "meijerPid": "4823220",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 20,
      "abv": 12,
      "ph": 2.69,
      "ta": 20,
      "composition": "Mango"
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Mango/FF%20MNG%208497001067%20UPC.jpg"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Mango/FF%20MNG%208497001067%20Bottle%20Front%20WHT.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Mango/FF%20MNG%208497001067%20Bottle%20Back%20WHT%20JPG.jpg"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Mango/FF%20MNG%208497001067%20Label%20Front.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Mango/FF%20MNG%208497001067%20Label%20Back.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-peach",
    "name": "Farm Fresh Peach",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 19,
    "iriDescription": null,
    "upcFull": "0-84970-01006-1",
    "upc10": "8497001006",
    "gtin": "10084970010068",
    "meijerPid": "4516609",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 5.9,
      "abv": 12,
      "ph": 3.9,
      "ta": 9.5,
      "composition": "Peach"
    },
    "marketingCopy": "This wine, made from peaches, is distinctly light and refreshing. With a nose...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Label%20Front.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Label%20Back%20.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-blackberry-moscato",
    "name": "Farm Fresh Blackberry Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 21,
    "iriDescription": null,
    "upcFull": "0-84970-01007-8",
    "upc10": "8497001007",
    "gtin": "10084970010075",
    "meijerPid": "4709964",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": 6.9,
      "abv": 6.8,
      "ph": 3.63,
      "ta": 10.2,
      "composition": "Blackberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blackberry Moscato is renowned for its de...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Spec%20Sheet.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Lifestyle%20Spec%20Sheet%20JPG.jpg"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Label%20Front.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blackberry%20Moscato/FF%20BLK%20MOSC%208497001007%20Label%20Back.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-blueberry-moscato",
    "name": "Farm Fresh Blueberry Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 22,
    "iriDescription": null,
    "upcFull": "0-84970-01008-5",
    "upc10": "8497001008",
    "gtin": "10084970010082",
    "meijerPid": "4709963",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 3.23,
      "ta": 8,
      "composition": "Blueberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blueberry Moscato is delicately sweet tas...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20Label%20Front%20JPG.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20Label%20Back%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-cranberry-moscato",
    "name": "Farm Fresh Cranberry Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 23,
    "iriDescription": null,
    "upcFull": "0-84970-01019-1",
    "upc10": "8497001019",
    "gtin": "10084970010198",
    "meijerPid": "5323470",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 3.23,
      "ta": 8,
      "composition": "0"
    },
    "marketingCopy": "Farm Fresh Cranberry Moscato is a bright blend designed to wake up the palate...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Cranberry%20Moscato/FF%20CRN%20MOSC%208497001019%20UPC.jpg"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Cranberry%20Moscato/FF%20CRN%20MOSC%208497001019%20Label%20Front.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Cranberry%20Moscato/FF%20CRN%20MOSC%208497001019%20Label%20Back.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-mango-moscato",
    "name": "Farm Fresh Mango Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 24,
    "iriDescription": null,
    "upcFull": "0-84970-01016-1",
    "upc10": "8497001016",
    "gtin": "10084970010167",
    "meijerPid": "4902392",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "Mango & Muscat"
    },
    "marketingCopy": "Tropical Mango Moscato is straw yellow in color. With a delicious blend of Mo...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Mango%20Moscato/FF%20MNG%20MOSC%208497001016%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Mango%20Moscato/FF%20MNG%20MOSC%208497001016%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Mango%20Moscato/FF%20MNG%20MOSC%208497001016%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Mango%20Moscato/FF%20MNG%20MOSC%208497001016%20Label%20Front%20JPG.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Mango%20Moscato/FF%20MNG%20MOSC%208497001016%20Label%20Back%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-peach-moscato",
    "name": "Farm Fresh Peach Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 25,
    "iriDescription": null,
    "upcFull": "0-84970-01011-5",
    "upc10": "8497001011",
    "gtin": "10084970010112",
    "meijerPid": "4709962",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": 9,
      "abv": 6.8,
      "ph": 3.9,
      "ta": 9.5,
      "composition": "Peach & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Peach Moscato is distinctly light and ref...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Spec%20Sheet.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Lifestyle%20Wine_Sheet.pdf"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Label%20Front.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Peach%20Moscato/FF%20PCH%20MOSC%208497001011%20Label%20Back.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-raspberry-moscato",
    "name": "Farm Fresh Raspberry Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 26,
    "iriDescription": null,
    "upcFull": "0-84970-01012-2",
    "upc10": "8497001012",
    "gtin": "10084970010129",
    "meijerPid": "4709961",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 0,
      "ta": 0,
      "composition": "Raspberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Raspberry Moscato tastes like a handful o...",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Spec%20Sheet%20PPT.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Lifestyle%20Spec%20Sheet.pdf"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Label%20Front.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Raspberry%20Moscato/FF%20RAS%20MOSC%208497001012%20Label%20Back.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "farm-fresh-blackberry-bubbly-moscato",
    "name": "Farm Fresh Blackberry Bubbly Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 28,
    "iriDescription": null,
    "upcFull": "0-84970-01053-5",
    "upc10": "8497001053",
    "gtin": "10084970010532",
    "meijerPid": "4823216",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 6.9,
      "abv": 6.8,
      "ph": 3.63,
      "ta": 10.2,
      "composition": "Blackberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blackberry Moscato is renowned for its delicately sweet taste that is neither watered down nor syrupy. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blackberry%20Bubbly/FF%20BLK%20BUBB%208497001053%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blackberry%20Bubbly/FF%20BLK%20BUBB%208497001053%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blackberry%20Bubbly/FF%20BLK%20BUBB%208497001053%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blackberry%20Bubbly/FF%20BLK%20BUBB%20Spec%20Sheet%208497001053%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blackberry%20Bubbly/FF%20BLK%20BUBB%20Spec%20Sheet%208497001053%20PPT.pptx"
      }
    ],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10.875\"",
      "caseLength": "13.75\"",
      "caseWeight": "40.5 lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5 lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "farm-fresh-blueberry-bubbly-moscato",
    "name": "Farm Fresh Blueberry Bubbly Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 29,
    "iriDescription": null,
    "upcFull": "0-84970-01059-7",
    "upc10": "8497001059",
    "gtin": "10084970010594",
    "meijerPid": "4823218",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 3.23,
      "ta": 8,
      "composition": "Blueberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blueberry Moscato is delicately sweet taste that is neither watered down nor syrupy with a hint of bubbles. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blueberry%20Bubbly/FF%20BLU%20BUBB%208497001059%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blueberry%20Bubbly/FF%20BLU%20BUBB%208497001059%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blueberry%20Bubbly/FF%20BLU%20BUBB%208497001059%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blueberry%20Bubbly/FF%20BLU%20BUBB%208497001059%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Blueberry%20Bubbly/FF%20BLU%20BUBB%208497001059%20Spec%20Sheet.pptx"
      }
    ],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10.875\"",
      "caseLength": "13.75\"",
      "caseWeight": "40.5 lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5 lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "farm-fresh-peach-bubbly-moscato",
    "name": "Farm Fresh Peach Bubbly Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 30,
    "iriDescription": null,
    "upcFull": "0-84970-01051-1",
    "upc10": "8497001051",
    "gtin": "10084970010518",
    "meijerPid": "4823217",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 9,
      "abv": 6.8,
      "ph": 3.9,
      "ta": 9.5,
      "composition": "Peach & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Peach Moscato is distinctly light and refreshing with a hint of bubbles. With a nose of white peach, the wine is a perfect crisp balance of fruit and sweetness. The lingering finish leaves the palate with a luscious taste of fresh peaches. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Peach%20Bubbly/FF%20PCH%20BUBB%20%208497001051%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Peach%20Bubbly/FF%20PCH%20BUBB%208497001051%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Peach%20Bubbly/FF%20PCH%20BUBB%208497001051%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Peach%20Bubbly/FF%20PCH%20BUBB%208497001051%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Peach%20Bubbly/FF%20PCH%20BUBB%208497001051%20Spec%20Sheet.pptx"
      }
    ],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10.875\"",
      "caseLength": "13.75\"",
      "caseWeight": "40.5 lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5 lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "farm-fresh-raspberry-bubbly-moscato",
    "name": "Farm Fresh Raspberry Bubbly Moscato",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 31,
    "iriDescription": null,
    "upcFull": "0-84970-01055-9",
    "upc10": "8497001055",
    "gtin": "10084970010556",
    "meijerPid": "4823219",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 0,
      "ta": 0,
      "composition": "Raspberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Raspberry Moscato tastes like a handful of fresh, juicy berries full of flavor, sweet, but tart and refreshing. Think red raspberry jam with a hint of bubbles. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Raspberry%20Bubbly/FF%20RAS%20BUBB%208497001055%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Raspberry%20Bubbly/FF%20RAS%20BUBB%208497001055%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Raspberry%20Bubbly/FF%20RAS%20BUBB%208497001055%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Raspberry%20Bubbly/FF%20RAS%20BUBB%208497001055%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Bubbly%20Moscato/Raspberry%20Bubbly/FF%20RAS%20BUBB%208497001055%20Spec%20Sheet.pptx"
      }
    ],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10.875\"",
      "caseLength": "13.75\"",
      "caseWeight": "40.5 lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5 lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "farm-fresh-blackberry-moscato-1-5l",
    "name": "Farm Fresh Blackberry Moscato 1.5L",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 33,
    "iriDescription": null,
    "upcFull": "0-84970-01072-6",
    "upc10": "8497001072",
    "gtin": "10084970010723",
    "meijerPid": "5323469",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "farm-fresh-cranberry-moscato-1-5l",
    "name": "Farm Fresh Cranberry Moscato 1.5L",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 34,
    "iriDescription": null,
    "upcFull": "0-84970-01074-0",
    "upc10": "8497001074",
    "gtin": "10084970010747",
    "meijerPid": "5323473",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "farm-fresh-peach-moscato-1-5l",
    "name": "Farm Fresh Peach Moscato 1.5L",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 35,
    "iriDescription": null,
    "upcFull": "0-84970-01077-1",
    "upc10": "8497001077",
    "gtin": "10084970010778",
    "meijerPid": "5323471",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "farm-fresh-raspberry-moscato-1-5l",
    "name": "Farm Fresh Raspberry Moscato 1.5L",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 36,
    "iriDescription": null,
    "upcFull": "0-84970-01079-5",
    "upc10": "8497001079",
    "gtin": "10084970010792",
    "meijerPid": "5323468",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "farm-fresh-blackberry-bubbly-moscato-can",
    "name": "Farm Fresh Blackberry Bubbly Moscato CAN",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 38,
    "iriDescription": null,
    "upcFull": "0-84970-01033-7",
    "upc10": "8497001033",
    "gtin": "10084970010334",
    "meijerPid": "4847009",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 6.9,
      "abv": 6.8,
      "ph": 3.63,
      "ta": 10.2,
      "composition": "Blackberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blackberry Moscato is renowned for its delicately sweet taste that is neither watered down nor syrupy. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blackberry%20Sleek%20Can/FF%20BLK%20BUBB%20CAN%208497001033%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blackberry%20Sleek%20Can/FF%20BLK%20BUBB%20CAN%208497001033%20Front%20PNG.png"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blackberry%20Sleek%20Can/FF%20BLK%20BUBB%20CAN%208497001033%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blackberry%20Sleek%20Can/FF%20BLK%20BUBB%208497001033%20CAN%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blackberry%20Sleek%20Can/FF%20BLK%20BUBB%208497001033%20CAN%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blackberry%20Sleek%20Can/FF%20BLK%20BUBB%208497001033%20CAN%20Label%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "farm-fresh-blueberry-bubbly-moscato-can",
    "name": "Farm Fresh Blueberry Bubbly Moscato CAN",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 39,
    "iriDescription": null,
    "upcFull": "0-84970-01039-9",
    "upc10": "8497001039",
    "gtin": "10084970010396",
    "meijerPid": "4847007",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 3.23,
      "ta": 8,
      "composition": "Blueberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blueberry Moscato is delicately sweet taste that is neither watered down nor syrupy with a hint of bubbles. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blueberry%20Sleek%20Can/FF%20BLU%20BUBB%20CAN%208497001039%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blueberry%20Sleek%20Can/FF%20BLU%20BUBB%20CAN%208497001033%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blueberry%20Sleek%20Can/FF%20BLU%20BUBB%20CAN%208497001033%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blueberry%20Sleek%20Can/FF%20BLU%20BUBB%20CAN%208497001033%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blueberry%20Sleek%20Can/FF%20BLU%20BUBB%20CAN%208497001033%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Blueberry%20Sleek%20Can/FF%20BLU%20BUBB%20CAN%208497001033%20Label%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "farm-fresh-peach-bubbly-moscato-can",
    "name": "Farm Fresh Peach Bubbly Moscato CAN",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 40,
    "iriDescription": null,
    "upcFull": "0-84970-01041-2",
    "upc10": "8497001041",
    "gtin": "10084970010419",
    "meijerPid": "4847010",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 9,
      "abv": 6.8,
      "ph": 3.9,
      "ta": 9.5,
      "composition": "Peach & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Peach Moscato is distinctly light and refreshing with a hint of bubbles. With a nose of white peach, the wine is a perfect crisp balance of fruit and sweetness. The lingering finish leaves the palate with a luscious taste of fresh peaches. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Peach%20Sleek%20Can/FF%20PCH%20BUBB%20CAN%208497001041%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Peach%20Sleek%20Can/FF%20PCH%20BUBB%20CAN%208497001041%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Peach%20Sleek%20Can/FF%20PCH%20BUBB%20CAN%208497001041%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Peach%20Sleek%20Can/FF%20PCH%20BUBB%20CAN%208497001041%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Peach%20Sleek%20Can/FF%20PCH%20BUBB%20CAN%208497001041%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Peach%20Sleek%20Can/FF%20PCH%20BUBB%20CAN%208497001041%20Label%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "farm-fresh-raspberry-bubbly-moscato-can",
    "name": "Farm Fresh Raspberry Bubbly Moscato CAN",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 41,
    "iriDescription": null,
    "upcFull": "0-84970-01036-8",
    "upc10": "8497001036",
    "gtin": "10084970010365",
    "meijerPid": "4847008",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 0,
      "ta": 0,
      "composition": "Raspberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Raspberry Moscato tastes like a handful of fresh, juicy berries full of flavor, sweet, but tart and refreshing. Think red raspberry jam with a hint of bubbles. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Raspberry%20Sleek%20Can/FF%20RAS%20BUBB%20CAN%208497001036%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Raspberry%20Sleek%20Can"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Raspberry%20Sleek%20Can/FF%20RAS%20BUBB%20CAN%208497001036%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Raspberry%20Sleek%20Can/FF%20RAS%20BUBB%20CAN%208497001036%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Raspberry%20Sleek%20Can/FF%20RAS%20BUBB%20CAN%208497001036%20Spec%20Sheet.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Raspberry%20Sleek%20Can/FF%20RAS%20BUBB%20CAN%208497001036%20Label%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "farm-fresh-can-variety-pack",
    "name": "Farm Fresh Can Variety Pack",
    "family": "Farm Fresh",
    "discontinued": false,
    "sourceRow": 42,
    "iriDescription": null,
    "upcFull": "0-84970-01049-8",
    "upc10": "8497001049",
    "gtin": "10084970010495",
    "meijerPid": "4848421",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML/ 4 PK",
      "glassType": "0",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "0"
    },
    "marketingCopy": "0",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20BUBB%20CAN%204PK%208497001049%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20CAN%204PK%208497001001%20Pack%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20CAN%204PK%208497001001%20Pack%20Side%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20CAN%204PK%208497001049%20Spec%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20CAN%204PK%208497001049%20Spec%20Sheet.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20CAN%204PK%208497001049%20Spec%20Sheet"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Cans/Multi%20Pack%20Cans/FF%20BUBB%20CAN%204PK%208497001049%20Label%20PDF.pdf"
      }
    ],
    "imperial": {
      "height": 6.32,
      "width": 2.32,
      "weightOz": 48.25,
      "weightLb": 0.145,
      "pack": 6,
      "caseHeight": "6.50\"",
      "caseWidth": "9.50\"",
      "caseLength": "14.25\"",
      "caseWeight": "18.25lbs",
      "palletCasesPerLayer": 12,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 16.0528,
      "weightGram": 65.770893592,
      "weightLb": 48.25,
      "pack": 0.145,
      "caseHeight": 16.51,
      "caseWidth": 24.13,
      "caseLength": 36.2,
      "caseWeight": 8.28,
      "palletCasesPerLayer": "18.25lbs",
      "palletLayers": 12,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "lakeshore-farms-apple",
    "name": "Lakeshore Farms Apple",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 44,
    "iriDescription": null,
    "upcFull": "9-84970-05110-1",
    "upc10": "8497005110",
    "gtin": "10084970051108",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Apple/LF%20APL%208497005110%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Apple/LS%20APL%208497005110%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Apple/LF%20APL%208497005110%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Apple/LF%20APL%208497005110%20Tech%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Apple/LF%20APL%208497005110%20Tech%20Sheet%20PPT.pptx"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": null,
      "weightLb": 0.1796875,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 0,
      "pack": 0.1796875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-blackberry",
    "name": "Lakeshore Farms Blackberry",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 45,
    "iriDescription": null,
    "upcFull": "0-84970-05121-7",
    "upc10": "8497005121",
    "gtin": "10084970051214",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 14.6,
      "abv": 12,
      "ph": 3.63,
      "ta": 10.2,
      "composition": "Blackberry"
    },
    "marketingCopy": "The nose is light, mellow and fruity with a hint of fresh picked ripe blackberries. Smooth, sweet, juicy ripe blackberry flavors abound. A pleasant crisp fruity flavor lingers on the tongue, reminiscent of blackberry cobbler made from scratch. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blackberry/LF%20BLK%208497001053%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blackberry/LF%20BLK%208497001053%20BOTTLE%20FRONT%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blackberry/LF%20BLK%208497001053%20BOTTLE%20BACK%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blackberry/Blackberry%20Tech%20Sheet%201P%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blackberry/Blackberry%20Tech%20Sheet%20PPT.pptx"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-farms-blueberry",
    "name": "Lakeshore Farms Blueberry",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 46,
    "iriDescription": null,
    "upcFull": "0-84970-05132-1",
    "upc10": "8497005132",
    "gtin": "10084970051320",
    "meijerPid": "506638",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 6.9,
      "abv": 12,
      "ph": 3.23,
      "ta": 8,
      "composition": "Blueberry"
    },
    "marketingCopy": "Renowned for its delicately sweet taste that is neither watered down nor syrupy. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blueberry/LF%20BLU%208497005132%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blueberry/LF%20BLU%208497005132%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blueberry/LF%20BLU%208497005132%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blueberry/LF%20BLU%208497005132%20Tech%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Blueberry/LF%20BLU%208497005132%20Tech%20Sheet%20PPT.pptx"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-farms-cherry",
    "name": "Lakeshore Farms Cherry",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 47,
    "iriDescription": null,
    "upcFull": "0-84970-05143-9",
    "upc10": "8497005143",
    "gtin": "10084970051436",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cherry/LF%20CHR%208497005143%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cherry/LF%20CHR%208497005143%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cherry/LF%20CHR%208497005143%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cherry/LF%20CHR%208497005143%20Tech%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cherry/LF%20CHR%208497005143%20Tech%20Sheet%20PPT.pptx"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": null,
      "weightLb": 0.1796875,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 0,
      "pack": 0.1796875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-cranberry",
    "name": "Lakeshore Farms Cranberry",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 48,
    "iriDescription": null,
    "upcFull": "0-84970-05154-1",
    "upc10": "8497005154",
    "gtin": "10084970051542",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 20,
      "abv": 12,
      "ph": 2.69,
      "ta": 20,
      "composition": "Cranberry"
    },
    "marketingCopy": "This lovely, light red wine with its sweet and tart flavor profile balances with sweet and pucker all in a single sip. On the sweet to tart red fruit spectrum, cranberries  sit between raspberries and redcurrants and the touch of sweetness on the front moves to a delicious snippy finish.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cranberry/LF%20CRN%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cranberry/LF%20CRN%208497005154%20Bottle%20Front.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cranberry/LF%20CRN%208497005154%20Bottle%20Back.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cranberry/LF%20CRN%208497005154%20Tech%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cranberry/LF%20CRN%208497005154%20Tech%20Sheet%20PPT.pptx"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Cranberry/LF%20CRN%20Lifestyle%20Photo.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-farms-mango",
    "name": "Lakeshore Farms Mango",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 49,
    "iriDescription": null,
    "upcFull": "0-84970-05165-1",
    "upc10": "8497005165",
    "gtin": "10084970051658",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Mango/LF%20MNG%208497005165%20UPC.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": null,
      "weightLb": 0.1796875,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 0,
      "pack": 0.1796875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-peach",
    "name": "Lakeshore Farms Peach",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 50,
    "iriDescription": null,
    "upcFull": "0-84970-05176-1",
    "upc10": "8497005176",
    "gtin": "10084970051764",
    "meijerPid": "506635",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 5.9,
      "abv": 12,
      "ph": 3.9,
      "ta": 9.5,
      "composition": "Peach"
    },
    "marketingCopy": "This wine, made from peaches, is distinctly light and refreshing. With a nose of white peach, the wine is a perfect crisp balance of fruit and sweetness. The lingering finish leaves the palate with a luscious taste of fresh peaches.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Peach/LF%20PCH%208497005176%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Peach/LF%20PCH%208497005176%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Peach/LF%20PCH%208497005176%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Fruit%20Wine/Peach/LF%20PCH%208497005176%20Tech%20Sheet%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Fruit%20Wine/Peach/FF%20PCH%208497001006%20Spec%20Sheet.pptx"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-farms-blackberry-moscato",
    "name": "Lakeshore Farms Blackberry Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 52,
    "iriDescription": null,
    "upcFull": "0-84790-06432-3",
    "upc10": "8479006432",
    "gtin": "10084790064326",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208497006432%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208479006432%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208479006432%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208497006432%201P%20PDF.pptx"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208497006432%201P%20PPT.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208497006432%20Label%20Front.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blackberry%20Moscato/LF%20BLK%20MOSC%208497006432%20Label%20Back.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-blueberry-moscato",
    "name": "Lakeshore Farms Blueberry Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 53,
    "iriDescription": null,
    "upcFull": "0-84970-06343-2",
    "upc10": "8497006343",
    "gtin": "10084970063439",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blueberry%20Moscato/LF%20BLU%20MOSC%208497006343%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blueberry%20Moscato/LF%20BLU%20MOSC%208497006343%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Blueberry%20Moscato/LF%20BLU%20MOSC%208497006343%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "Lifestyle Sheet",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Farm%20Fresh/Moscato/Blueberry%20Moscato/FF%20BLU%20MOSC%208497001008%20LFSTYL%20JPG.jpeg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-cranberry-moscato",
    "name": "Lakeshore Farms Cranberry Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 54,
    "iriDescription": null,
    "upcFull": "0-84970-06745-4",
    "upc10": "8497006745",
    "gtin": "10084970067451",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-mango-moscato",
    "name": "Lakeshore Farms Mango Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 55,
    "iriDescription": null,
    "upcFull": "0-84970-06254-1",
    "upc10": "8497006254",
    "gtin": "10084970062548",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Mango%20Moscato/LF%20MNG%20MOSC%208497006254%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Mango%20Moscato/LF%20MNG%20MOSC%208497006254%20Bottle%20Front.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-peach-moscato",
    "name": "Lakeshore Farms Peach Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 56,
    "iriDescription": null,
    "upcFull": "0-84970-06165-0",
    "upc10": "8497006165",
    "gtin": "10084970061657",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%20%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%201P%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%201P%20PPT.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%20Label%20Front%20JPG.jpg"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Peach%20Moscato/LF%20PCH%20MOSC%208497006165%20Label%20Back%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-raspberry-moscato",
    "name": "Lakeshore Farms Raspberry Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 57,
    "iriDescription": null,
    "upcFull": "0-84970-06541-2",
    "upc10": "8497006541",
    "gtin": "10084970065419",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W68",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Raspberry%20Moscato/LF%20RSP%20MOSC%208497006541%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Raspberry%20Moscato/LF%20RSP%20MOSC%208497006541%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Raspberry%20Moscato/LF%20RSP%20MOSC%208497006541%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Raspberry%20Moscato/LF%20RAS%20MOSC%201P%208497006541%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Moscato/LF%20Raspberry%20Moscato/LF%20RAS%20MOSC%201P%208497006541%20%20PPT.pptx"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-blackberry-bubbly-moscato",
    "name": "Lakeshore Farms Blackberry Bubbly Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 59,
    "iriDescription": null,
    "upcFull": "0-84970-06419-4",
    "upc10": "8497006419",
    "gtin": "10084970064191",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Blackberry%20Bubbly%20Moscato/LF%20BLK%20BUBB%208497006419%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Blackberry%20Bubbly%20Moscato/LF%20BLK%20BUBB%208497006419%20BTL%20FR%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Blackberry%20Bubbly%20Moscato/LF%20BLK%20BUBB%208497006419%20BTL%20BK%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-blueberry-bubbly-moscato",
    "name": "Lakeshore Farms Blueberry Bubbly Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 60,
    "iriDescription": null,
    "upcFull": "0-84970-06351-7",
    "upc10": "8497006351",
    "gtin": "10084970063514",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Blueberry%20Bubbly%20Moscato/LF%20BLU%20BUBB%208497006351%20UPC.pdf"
      }
    ],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-peach-bubbly-moscato",
    "name": "Lakeshore Farms Peach Bubbly Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 61,
    "iriDescription": null,
    "upcFull": "0-84970-06146-9",
    "upc10": "8497006146",
    "gtin": "10084970061466",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Peach%20Bubbly%20Moscato/LF%20PCH%20BUBB%208497006146%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Peach%20Bubbly%20Moscato/LF%20PCH%20BUBB%208497006146%20BTL%20FR%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Peach%20Bubbly%20Moscato/LF%20PCH%20BUBB%208497006146%20BTL%20BK%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-raspberry-bubbly-moscato",
    "name": "Lakeshore Farms Raspberry Bubbly Moscato",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 62,
    "iriDescription": null,
    "upcFull": "0-84970-06521-4",
    "upc10": "8497006521",
    "gtin": "10084970065211",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Raspberry%20Bubbly%20Moscato/LF%20RAS%20BUBB%208497006521%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Raspberry%20Bubbly%20Moscato/LF%20RAS%20BUBB%208497006521%20BTL%20FR%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Lakeshore%20Farms/LF%20Bubbly%20Moscato/LF%20Raspberry%20Bubbly%20Moscato/LF%20RAS%20BUBB%208497006521%20BTL%20BK%20JPG.jpg"
      }
    ],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lakeshore-farms-blackberry-bubbly-moscato-can",
    "name": "Lakeshore Farms Blackberry Bubbly Moscato CAN",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 64,
    "iriDescription": null,
    "upcFull": "0-84970-01033-7",
    "upc10": "8497001033",
    "gtin": "10084970010334",
    "meijerPid": "4847009",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 6.9,
      "abv": 6.8,
      "ph": 3.63,
      "ta": 10.2,
      "composition": "Blackberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blackberry Moscato is renowned for its delicately sweet taste that is neither watered down nor syrupy. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "lakeshore-farms-blueberry-bubbly-moscato-can",
    "name": "Lakeshore Farms Blueberry Bubbly Moscato CAN",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 65,
    "iriDescription": null,
    "upcFull": "0-84970-01039-1",
    "upc10": "8497001039",
    "gtin": "10084970010396",
    "meijerPid": "4847007",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 3.23,
      "ta": 8,
      "composition": "Blueberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Blueberry Moscato is delicately sweet taste that is neither watered down nor syrupy with a hint of bubbles. Mouthfeel has a slightly sweet taste with a bit of acid and feels just smooth, pairing nicely with cheese and fruits with cinnamon. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "lakeshore-farms-peach-bubbly-moscato-can",
    "name": "Lakeshore Farms Peach Bubbly Moscato CAN",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 66,
    "iriDescription": null,
    "upcFull": "0-84970-01041-1",
    "upc10": "8497001041",
    "gtin": "10084970010419",
    "meijerPid": "4847010",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 9,
      "abv": 6.8,
      "ph": 3.9,
      "ta": 9.5,
      "composition": "Peach & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Peach Moscato is distinctly light and refreshing with a hint of bubbles. With a nose of white peach, the wine is a perfect crisp balance of fruit and sweetness. The lingering finish leaves the palate with a luscious taste of fresh peaches. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "lakeshore-farms-raspberry-bubbly-moscato-can",
    "name": "Lakeshore Farms Raspberry Bubbly Moscato CAN",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 67,
    "iriDescription": null,
    "upcFull": "0-84970-01036-1",
    "upc10": "8497001036",
    "gtin": "10084970010365",
    "meijerPid": "4847008",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 0,
      "ta": 0,
      "composition": "Raspberry & Muscat"
    },
    "marketingCopy": "Sweet and crisp, our farm-to-bottle Raspberry Moscato tastes like a handful of fresh, juicy berries full of flavor, sweet, but tart and refreshing. Think red raspberry jam with a hint of bubbles. Best consumed chilled to help bring out the fresh fruit qualities of the wine.",
    "assets": [],
    "imperial": {
      "height": 6.25,
      "width": 2.25,
      "weightOz": 12,
      "weightLb": 0.140625,
      "pack": 12,
      "caseHeight": "6.44\"",
      "caseWidth": "7.07\"",
      "caseLength": "9.38\"",
      "caseWeight": "9.1lbs",
      "palletCasesPerLayer": 24,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 15.875,
      "weightGram": 63.786426975,
      "weightLb": 12,
      "pack": 0.140625,
      "caseHeight": 16.36,
      "caseWidth": 17.96,
      "caseLength": 23.83,
      "caseWeight": 4.13,
      "palletCasesPerLayer": "9.1lbs",
      "palletLayers": 24,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "lakeshore-farms-can-variety-pack",
    "name": "Lakeshore Farms Can Variety Pack",
    "family": "Lakeshore Farms",
    "discontinued": false,
    "sourceRow": 68,
    "iriDescription": null,
    "upcFull": "0-84970-01049-1",
    "upc10": "8497001049",
    "gtin": "10084970010495",
    "meijerPid": "4848421",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "355 ML/ 4 PK",
      "glassType": "0",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "0"
    },
    "marketingCopy": "0",
    "assets": [],
    "imperial": {
      "height": 6.32,
      "width": 2.32,
      "weightOz": 48.25,
      "weightLb": 0.145,
      "pack": 6,
      "caseHeight": "6.50\"",
      "caseWidth": "9.50\"",
      "caseLength": "14.25\"",
      "caseWeight": "18.25lbs",
      "palletCasesPerLayer": 12,
      "palletLayers": 6,
      "palletHeight": "48\"",
      "palletLength": "48\"",
      "palletWidth": "40\"",
      "palletWeight": 1500
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 16.0528,
      "weightGram": 65.770893592,
      "weightLb": 48.25,
      "pack": 0.145,
      "caseHeight": 16.51,
      "caseWidth": 24.13,
      "caseLength": 36.2,
      "caseWeight": 8.28,
      "palletCasesPerLayer": "18.25lbs",
      "palletLayers": 12,
      "palletHeight": 121.92,
      "palletLength": 121.92,
      "palletWidth": 101.6,
      "palletWeight": 680.39
    }
  },
  {
    "id": "country-crush-blackberry",
    "name": "Country Crush Blackberry",
    "family": "Country Crush",
    "discontinued": false,
    "sourceRow": 70,
    "iriDescription": null,
    "upcFull": "0-84970-08125-2",
    "upc10": "8497008125",
    "gtin": "10084970081259",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/UPC%20CC%208497008125%20BLK.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%20BTL%20FR%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%20BTL%20BK%20JPG.jpg"
      },
      {
        "label": "Bottle Front PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%20BTL%20FR%20PNG.png"
      },
      {
        "label": "Bottle Back PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%20BTL%20BK%20PNG.png"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%201P%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%201P%20PPT.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%20FR%20BK%20LABEL.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Blackberry%20Fruit%20Wine/CC%20BLK%208497008125%20FR%20BK%20LABEL.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "country-crush-cranberry",
    "name": "Country Crush Cranberry",
    "family": "Country Crush",
    "discontinued": false,
    "sourceRow": 71,
    "iriDescription": null,
    "upcFull": "0-84970-08158-0",
    "upc10": "8497008158",
    "gtin": "10084970081587",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20Bottle%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20Bottle%20Back%20JPG.jpg"
      },
      {
        "label": "Bottle Front PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20Bottle%20Front%20PNG.png"
      },
      {
        "label": "Bottle Back PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20Bottle%20Back%20PNG.png"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%201P.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%201P%20PPT.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20LBL%20FR%20BK.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Cranberry%20Fruit%20Wine/CC%20CRAN%208497008158%20LBL%20FR%20BK.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "country-crush-peach",
    "name": "Country Crush Peach",
    "family": "Country Crush",
    "discontinued": false,
    "sourceRow": 72,
    "iriDescription": null,
    "upcFull": "0-84970-08169-6",
    "upc10": "8497008169",
    "gtin": "10084970081693",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/UPC%20CC%208497008169%20PCH.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%20BTL%20FR%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%20BTL%20BK%20JPG.jpg"
      },
      {
        "label": "Bottle Front PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%20BTL%20FR%20PNG.png"
      },
      {
        "label": "Bottle Back PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%20BTL%20BK%20PNG.png"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%201P%20PDF.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%201P%20PPT.pptx"
      },
      {
        "label": "Front Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%20LBL%20FR%20BK.pdf"
      },
      {
        "label": "Back Label",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Country%20Crush/CC%20Peach%20Fruit%20Wine/CC%20PCH%208497008169%20LBL%20FR%20BK.pdf"
      }
    ],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 2.6875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 2.6875,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "great-lakes-red-750ml",
    "name": "Great Lakes Red 750ml",
    "family": "Great Lakes Red",
    "discontinued": false,
    "sourceRow": 74,
    "iriDescription": null,
    "upcFull": "0-84970-07050-1",
    "upc10": "8497007050",
    "gtin": "10084970070505",
    "meijerPid": "506639",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 5.25,
      "abv": 12.5,
      "ph": 0,
      "ta": 7.5,
      "composition": "Concord"
    },
    "marketingCopy": "A wine reminiscent to grape juice and jelly. With its foxy essence and rich color, it is a blessing to your palette.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "great-lakes-red-bubbly",
    "name": "Great Lakes Red Bubbly",
    "family": "Great Lakes Red",
    "discontinued": false,
    "sourceRow": 75,
    "iriDescription": null,
    "upcFull": "0-84970-07055-1",
    "upc10": "8497007055",
    "gtin": "10084970070550",
    "meijerPid": "4360273",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W25",
      "rs": 5.25,
      "abv": 12.5,
      "ph": 0,
      "ta": 7.5,
      "composition": "Concord"
    },
    "marketingCopy": "A wine reminiscent to grape juice and jelly. With its foxy essence and rich color, it is a blessing to your palette.",
    "assets": [],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10 7/8\"",
      "caseLength": "13 3/4\"",
      "caseWeight": "40.5lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "great-lakes-red-can",
    "name": "Great Lakes Red Can",
    "family": "Great Lakes Red",
    "discontinued": false,
    "sourceRow": 76,
    "iriDescription": null,
    "upcFull": "0-84970-02101-1",
    "upc10": "8497002101",
    "gtin": "10084970021019",
    "meijerPid": "4516598",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "375 ML",
      "glassType": "can",
      "rs": 5.25,
      "abv": 12.5,
      "ph": 0,
      "ta": 7.5,
      "composition": "Concord"
    },
    "marketingCopy": "A wine reminiscent to grape juice and jelly. With its foxy essence and rich color, it is a blessing to your palette.",
    "assets": [],
    "imperial": {
      "height": 5.125,
      "width": 2.625,
      "weightOz": 14,
      "weightLb": 0.1640625,
      "pack": 12,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": "11lbs",
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 13.0175,
      "weightGram": 74.41749813749999,
      "weightLb": 14,
      "pack": 0.1640625,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 4.99,
      "palletCasesPerLayer": "11lbs",
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "great-lakes-red-1-5l",
    "name": "Great Lakes Red 1.5L",
    "family": "Great Lakes Red",
    "discontinued": false,
    "sourceRow": 77,
    "iriDescription": null,
    "upcFull": "0-84970-07051-1",
    "upc10": "8497007051",
    "gtin": "10084970070512",
    "meijerPid": "3967088",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "1.5 L",
      "glassType": "W26",
      "rs": 5.25,
      "abv": 12.5,
      "ph": 0,
      "ta": 7.5,
      "composition": "Concord"
    },
    "marketingCopy": "A wine reminiscent to grape juice and jelly. With its foxy essence and rich color, it is a blessing to your palette.",
    "assets": [],
    "imperial": {
      "height": 13.125,
      "width": 4,
      "weightOz": 81,
      "weightLb": 0.25,
      "pack": 6,
      "caseHeight": "13 5/8\"",
      "caseWidth": "9 1/4\"",
      "caseLength": "12 3/4\"",
      "caseWeight": "31.5lbs",
      "palletCasesPerLayer": 16,
      "palletLayers": 4,
      "palletHeight": "58\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2056
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 33.3375,
      "weightGram": 113.3980924,
      "weightLb": 81,
      "pack": 0.25,
      "caseHeight": 34.61,
      "caseWidth": 23.5,
      "caseLength": 32.38,
      "caseWeight": 14.29,
      "palletCasesPerLayer": "31.5lbs",
      "palletLayers": 16,
      "palletHeight": 147.32,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 932.59
    }
  },
  {
    "id": "winter-white-bubbly",
    "name": "Winter White Bubbly",
    "family": "Winter White",
    "discontinued": false,
    "sourceRow": 79,
    "iriDescription": null,
    "upcFull": "0-84970-00118-1",
    "upc10": "8497000118",
    "gtin": "10084970001189",
    "meijerPid": "4247494",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W25",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A twist on our classic Winter White. This bubbly is remarkably fresh and effervescent. A great wine for a celebratory toast.",
    "assets": [],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10 7/8\"",
      "caseLength": "13 3/4\"",
      "caseWeight": "40.5lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "winter-white-can",
    "name": "Winter White Can",
    "family": "Winter White",
    "discontinued": false,
    "sourceRow": 80,
    "iriDescription": null,
    "upcFull": "0-84970-02102-1",
    "upc10": "8497002102",
    "gtin": "10084970021026",
    "meijerPid": "4516592",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "375 ML",
      "glassType": "can",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A twist on our classic Winter White. This bubbly is remarkably fresh and effervescent. A great wine for a celebratory toast.",
    "assets": [],
    "imperial": {
      "height": 5.125,
      "width": 2.625,
      "weightOz": 14,
      "weightLb": 0.1640625,
      "pack": 12,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": "11lbs",
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 13.0175,
      "weightGram": 74.41749813749999,
      "weightLb": 14,
      "pack": 0.1640625,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 4.99,
      "palletCasesPerLayer": "11lbs",
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "winter-white-750ml",
    "name": "Winter White 750ml",
    "family": "Winter White",
    "discontinued": false,
    "sourceRow": 81,
    "iriDescription": null,
    "upcFull": "0-84970-00105-2",
    "upc10": "8497000105",
    "gtin": "10084970001059",
    "meijerPid": "506622",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A fan favorite for all seasons, this bright and crisp wine is pleasing to all palates. A crisp and semi-sweet wine when only the freshest will do.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "winter-white-1-5l",
    "name": "Winter White 1.5L",
    "family": "Winter White",
    "discontinued": false,
    "sourceRow": 82,
    "iriDescription": null,
    "upcFull": "0-84970-00110-6",
    "upc10": "8497000110",
    "gtin": "10084970001103",
    "meijerPid": "506627",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "1.5 L",
      "glassType": "W26 stelvin",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A fan favorite for all seasons, this bright and crisp wine is pleasing to all palates. A crisp and semi-sweet wine when only the freshest will do.",
    "assets": [],
    "imperial": {
      "height": 12.75,
      "width": 4,
      "weightOz": 76,
      "weightLb": 0.25,
      "pack": 6,
      "caseHeight": "12 7/8\"",
      "caseWidth": "8 3/4\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "30.5lbs",
      "palletCasesPerLayer": 16,
      "palletLayers": 4,
      "palletHeight": "57\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1992
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 32.385,
      "weightGram": 113.3980924,
      "weightLb": 76,
      "pack": 0.25,
      "caseHeight": 32.7,
      "caseWidth": 22.23,
      "caseLength": 31.75,
      "caseWeight": 13.83,
      "palletCasesPerLayer": "30.5lbs",
      "palletLayers": 16,
      "palletHeight": 144.78,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 903.56
    }
  },
  {
    "id": "lakeshore-collection-moscato",
    "name": "Lakeshore Collection Moscato",
    "family": "Lakeshore Collection",
    "discontinued": false,
    "sourceRow": 84,
    "iriDescription": null,
    "upcFull": "0-84970-00112-1",
    "upc10": "8497000112",
    "gtin": "10084970001127",
    "meijerPid": "3380074",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 6.25,
      "abv": 10,
      "ph": 0,
      "ta": 5.5,
      "composition": "Muscat"
    },
    "marketingCopy": "This wines clean and crisp scent is followed by sweet and sassy fruit flavors that create an inviting and mellow taste in your mouth.",
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-collection-pinot-grigio",
    "name": "Lakeshore Collection Pinot Grigio",
    "family": "Lakeshore Collection",
    "discontinued": false,
    "sourceRow": 85,
    "iriDescription": null,
    "upcFull": "0-84970-00113-1",
    "upc10": "8497000113",
    "gtin": "10084970001134",
    "meijerPid": "3796601",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 0.5,
      "abv": 13,
      "ph": 0,
      "ta": 6.5,
      "composition": "Pinot Grigio"
    },
    "marketingCopy": "This wine is well balanced and just crosses over from dry to semi-dry. With notes of grapefruit, lemongrass, and green apple, it will surely tickle your tongue any time of the day.",
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-collection-red",
    "name": "Lakeshore Collection Red",
    "family": "Lakeshore Collection",
    "discontinued": false,
    "sourceRow": 86,
    "iriDescription": null,
    "upcFull": "0-84970-00111-1",
    "upc10": "8497000111",
    "gtin": "10084970001110",
    "meijerPid": "3710124",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 0.5,
      "abv": 13,
      "ph": 0,
      "ta": 6.25,
      "composition": "Merlot/ Cab Sauvé"
    },
    "marketingCopy": "This pleasantly spirited red blends bright fruit underscored with threads of tobacco and smoke to make an easy drinking table wine.",
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "lakeshore-collection-riesling",
    "name": "Lakeshore Collection Riesling",
    "family": "Lakeshore Collection",
    "discontinued": false,
    "sourceRow": 87,
    "iriDescription": null,
    "upcFull": "0-84970-20003-1",
    "upc10": "8497020003",
    "gtin": "10084970200032",
    "meijerPid": "506643",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 5.25,
      "abv": 10.5,
      "ph": 0,
      "ta": 6.75,
      "composition": "Riesling"
    },
    "marketingCopy": "A sweet but not to sweet take on Riesling. This wine has inviting flavors of fresh peaches, apricots, and pears. A true wine of Northern Michigan that pairs well with any entrée or dessert.",
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 43,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 43,
      "pack": 0.1796875,
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "chills-blackberry",
    "name": "Chills Blackberry",
    "family": "Chill",
    "discontinued": false,
    "sourceRow": 89,
    "iriDescription": null,
    "upcFull": "0-84970-00116-2",
    "upc10": "8497000116",
    "gtin": "10084970001165",
    "meijerPid": "3380072",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A semi-sweet white wine with abundant flavors of fresh raspberries, blueberries, and strawberries. A daring twist on winter white when you need a splash of fruitiness.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "chills-mango",
    "name": "Chills Mango",
    "family": "Chill",
    "discontinued": false,
    "sourceRow": 90,
    "iriDescription": null,
    "upcFull": "0-84970-00114-2",
    "upc10": "8497000114",
    "gtin": "10084970001141",
    "meijerPid": "3796603",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A semi-sweet white wine with grace notes of Michigan cherries. A daring twist on winter white when you need a splash of fruitiness.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "chills-sweet-peach",
    "name": "Chills Sweet Peach",
    "family": "Chill",
    "discontinued": false,
    "sourceRow": 91,
    "iriDescription": null,
    "upcFull": "0-84970-00115-1",
    "upc10": "8497000115",
    "gtin": "10084970001158",
    "meijerPid": "3380075",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "This semi-sweet white wine has an abiding peach flavor and bright nose. A daring twist on winter white when you need a splash of fruitiness.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "chills-watermelon",
    "name": "Chills Watermelon",
    "family": "Chill",
    "discontinued": false,
    "sourceRow": 92,
    "iriDescription": null,
    "upcFull": "0-84970-00117-2",
    "upc10": "8497000117",
    "gtin": "10084970001172",
    "meijerPid": "3380073",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 4.24,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "The crisp and clean taste of a granny smith apple comes forward in this semi-sweet white wine. A daring twist on winter white when you need a splash of fruitiness.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "autumn-harvest",
    "name": "Autumn Harvest",
    "family": "Seasonal",
    "discontinued": false,
    "sourceRow": 94,
    "iriDescription": null,
    "upcFull": "0-84970-00104-5",
    "upc10": "8497000104",
    "gtin": "10084970001042",
    "meijerPid": "506621",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 1,
      "abv": 12.5,
      "ph": 0,
      "ta": 7,
      "composition": "Ruby Cabernet"
    },
    "marketingCopy": "Autumn",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "spring-splendor",
    "name": "Spring Splendor",
    "family": "Seasonal",
    "discontinued": false,
    "sourceRow": 95,
    "iriDescription": null,
    "upcFull": "0-84970-00102-1",
    "upc10": "8497000102",
    "gtin": "10084970001028",
    "meijerPid": "506619",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 2.5,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "Spring Splendor is the perfect name for this white wine. With a balanced floral bouquet and just a touch of sweetness, its simplicity leaves a promise just like spring itself.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "summer-sunset-rose",
    "name": "Summer Sunset Rose'",
    "family": "Seasonal",
    "discontinued": false,
    "sourceRow": 96,
    "iriDescription": null,
    "upcFull": "0-84970-00103-8",
    "upc10": "8497000103",
    "gtin": "10084970001035",
    "meijerPid": "506620",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 2.5,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A blush wine with a sunny presence and forward suggestions of summner strawberries and melon with just a hint of vanilla. Perfect for sipping on after a day in the Michigan sun.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Product%20Photos/Summer%20Sunset%20UPC.pdf"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Product%20Photos/Summer%20Sunset%208497000103%20Bottle%20Front.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Product%20Photos/Summer%20Sunset%208497000103%20Bottle%20Back.jpg"
      },
      {
        "label": "Bottle Front PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Product%20Photos/front.png"
      },
      {
        "label": "Bottle Back PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Product%20Photos/back.png"
      },
      {
        "label": "One Page Sell Sheet PDF",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Spec%20Sheets/Summer%20Sunset%20Rose%20-%20One%20Page%20Information%20Sheet.pdf"
      },
      {
        "label": "One Page Sell Sheet PPT",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/LWC%20Seasonal%20Series/Summer%20Sunset/Spec%20Sheets/Summer%20Sunset%20Rose%20-%20One%20Page%20Information%20Sheet.pptx"
      }
    ],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 42,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 42,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "summer-sunset-bubbly-750",
    "name": "Summer Sunset Bubbly 750",
    "family": "Seasonal",
    "discontinued": false,
    "sourceRow": 97,
    "iriDescription": null,
    "upcFull": "0-84970-00119-1",
    "upc10": "8497000119",
    "gtin": "10084970001196",
    "meijerPid": "4645111",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W25",
      "rs": 2.5,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A blush wine with a sunny presence and forward suggestions of summer strawberries and melon with just a hint of vanilla. Perfect for sipping on after a day in the Michigan sun.",
    "assets": [],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10 7/8\"",
      "caseLength": "13 3/4\"",
      "caseWeight": "40.5lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "summer-sunset-can",
    "name": "Summer Sunset Can",
    "family": "Seasonal",
    "discontinued": false,
    "sourceRow": 98,
    "iriDescription": null,
    "upcFull": "0-84970-02103-1",
    "upc10": "8497002103",
    "gtin": "10084970021033",
    "meijerPid": "4516590",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "375 ML",
      "glassType": "can",
      "rs": 2.5,
      "abv": 12,
      "ph": 0,
      "ta": 6.5,
      "composition": "French Colombard"
    },
    "marketingCopy": "A blush wine with a sunny presence and forward suggestions of summer strawberries and melon with just a hint of vanilla. Perfect for sipping on after a day in the Michigan sun.",
    "assets": [],
    "imperial": {
      "height": 5.125,
      "width": 2.625,
      "weightOz": 14,
      "weightLb": 0.1640625,
      "pack": 12,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": "11lbs",
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 13.0175,
      "weightGram": 74.41749813749999,
      "weightLb": 14,
      "pack": 0.1640625,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 4.99,
      "palletCasesPerLayer": "11lbs",
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "estate-late-harvest-riesling",
    "name": "Estate Late Harvest Riesling",
    "family": "Estate",
    "discontinued": false,
    "sourceRow": 100,
    "iriDescription": null,
    "upcFull": "0-84970-07053-1",
    "upc10": "8497007053",
    "gtin": "10084970070536",
    "meijerPid": "506636",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "0"
    },
    "marketingCopy": "0",
    "assets": [],
    "imperial": {
      "height": 0,
      "width": 0,
      "weightOz": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "estate-pinot-grigio",
    "name": "Estate Pinot Grigio",
    "family": "Estate",
    "discontinued": false,
    "sourceRow": 101,
    "iriDescription": null,
    "upcFull": "0-84970-02037-2",
    "upc10": "8497002037",
    "gtin": "10084970020371",
    "meijerPid": "2978960",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 0.24,
      "abv": 12.9,
      "ph": 3.41,
      "ta": 5.9,
      "composition": "Pinot Gris"
    },
    "marketingCopy": "Medium bodied, a great balance of aromatic apricots and stone fruits with a crisp clean acidity.",
    "assets": [],
    "imperial": {
      "height": 0,
      "width": 0,
      "weightOz": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "festivus",
    "name": "Festivus",
    "family": "Seasonal",
    "discontinued": false,
    "sourceRow": 103,
    "iriDescription": null,
    "upcFull": "0-84970-00189-2",
    "upc10": "8497000189",
    "gtin": "10084970001899",
    "meijerPid": "4756003",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 1.5,
      "abv": 14,
      "ph": 0,
      "ta": 0,
      "composition": "100% Cabernet Sauve"
    },
    "marketingCopy": "This silky, red-blend has classic Cabernet aromatics with black pepper and dark fruit. The soft, round palate has a medium-dry finish with mild, smooth tannins.",
    "assets": [],
    "imperial": {
      "height": 11.78,
      "width": 2.97,
      "weightOz": 43.5,
      "weightLb": 0.185625,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 29.9212,
      "weightGram": 84.198083607,
      "weightLb": 43.5,
      "pack": 0.185625,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "cold-duck",
    "name": "Cold Duck",
    "family": "Cold Duck",
    "discontinued": false,
    "sourceRow": 104,
    "iriDescription": null,
    "upcFull": "0-84970-02126-5",
    "upc10": "8497002126",
    "gtin": "10084970021262",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": 99,
      "miBottle": 0,
      "miSrp": 131.99,
      "ohCase": 87.95,
      "ohBottle": 10.999166666666667,
      "ohSrp": 131.89000000000001
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": "This fruit-forward, light-bodied sparkling red wine bursts with ripe red fruit notes and a persistent, joyful effervescence. It’s a playful, approachable red blend that turns any casual gathering into a true celebration.",
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cold%20Duck/Cold%20Duck%20UPC.png"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cold%20Duck/COLD%20DUCK%20FRT%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cold%20Duck/COLD%20DUCK%20BCK%20JPG.jpg"
      },
      {
        "label": "Bottle Front PNG",
        "url": "https://leelanauwc-my.sharepoint.com/:i:/g/personal/jonb_lwc_wine/ERM5bOC31zZJgmgSqiYMXzkBTbKKGzIKRqobkKKNAlajoQ?e=wzgilH"
      },
      {
        "label": "Bottle Back PNG",
        "url": "https://leelanauwc-my.sharepoint.com/:i:/g/personal/jonb_lwc_wine/EWeHupLoBAFJiVJ-a1KqsdABbCd-WIAOmDxpp3_PrMvsYQ?e=FBmXfa"
      }
    ],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 3.2625,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10 7/8\"",
      "caseLength": "13 3/4\"",
      "caseWeight": "40.5lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": 32.385,
      "widthCm": 8.255,
      "weightGram": 1479.84510582,
      "weightLb": 52.2,
      "pack": 3.2625,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "cherries-galore",
    "name": "Cherries Galore",
    "family": "Cherries Galore",
    "discontinued": false,
    "sourceRow": 105,
    "iriDescription": null,
    "upcFull": "0-84970-06247-3",
    "upc10": "8497006247",
    "gtin": "10084970062470",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 7.3,
      "abv": 6.8,
      "ph": 3.23,
      "ta": 8,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [
      {
        "label": "UPC",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cherries%20Galore/Product%20Photos/CHR%20GAL%20UPC.png"
      },
      {
        "label": "Bottle Front JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cherries%20Galore/Product%20Photos/Cherries%20Galore%20Front%20JPG.jpg"
      },
      {
        "label": "Bottle Back JPG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cherries%20Galore/Product%20Photos/Cherries%20Galore%20Back%20JPG.jpg"
      },
      {
        "label": "Bottle Front PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cherries%20Galore/Product%20Photos/Cherries%20Galore%20Front.png"
      },
      {
        "label": "Bottle Back PNG",
        "url": "https://leelanauwc-my.sharepoint.com/personal/jonb_lwc_wine/Documents/Documents/Item%20Information/Cherries%20Galore/Product%20Photos/Cherries%20Galore%20Back.png"
      }
    ],
    "imperial": {
      "height": 12.75,
      "width": 3.25,
      "weightOz": 52.2,
      "weightLb": 0.203125,
      "pack": 12,
      "caseHeight": "13\"",
      "caseWidth": "10.875\"",
      "caseLength": "13.75\"",
      "caseWeight": "40.5 lbs",
      "palletCasesPerLayer": 11,
      "palletLayers": 5,
      "palletHeight": "69 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2268
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 32.385,
      "weightGram": 92.135950075,
      "weightLb": 52.2,
      "pack": 0.203125,
      "caseHeight": 33.02,
      "caseWidth": 27.62,
      "caseLength": 34.92,
      "caseWeight": 18.37,
      "palletCasesPerLayer": "40.5 lbs",
      "palletLayers": 11,
      "palletHeight": 176.53,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1028.75
    }
  },
  {
    "id": "sweet-red",
    "name": "Sweet Red",
    "family": "Leelanau Cellars",
    "discontinued": false,
    "sourceRow": 106,
    "iriDescription": null,
    "upcFull": "0-84970-00120-1",
    "upc10": "8497000120",
    "gtin": "10084970001202",
    "meijerPid": "506628",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "0"
    },
    "marketingCopy": "For fans of reds who want something on the sweeter side. This red has notes of raspberries and citrus, with an ample fruit flavor.",
    "assets": [],
    "imperial": {
      "height": 11.5,
      "width": 3,
      "weightOz": 12,
      "weightLb": 0.1875,
      "pack": 12,
      "caseHeight": "12\"",
      "caseWidth": "9 5/8\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "64\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2515
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 29.21,
      "weightGram": 85.0485693,
      "weightLb": 12,
      "pack": 0.1875,
      "caseHeight": 30.48,
      "caseWidth": 24.45,
      "caseLength": 31.75,
      "caseWeight": 14.97,
      "palletCasesPerLayer": "33lbs",
      "palletLayers": 15,
      "palletHeight": 162.56,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1140.78
    }
  },
  {
    "id": "red-sangria",
    "name": "Red Sangria",
    "family": "Leelanau Cellars",
    "discontinued": false,
    "sourceRow": 107,
    "iriDescription": null,
    "upcFull": "0-84970-00100-1",
    "upc10": "8497000100",
    "gtin": "10084970001004",
    "meijerPid": "3710123",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W5 stelvin",
      "rs": 6,
      "abv": 12,
      "ph": 0,
      "ta": 7,
      "composition": "Ruby Cabernet"
    },
    "marketingCopy": "With intense and pleasant aromas of ripe raspberries married with lingering notes of tart black cherries and rhubarb, this sangria has nice and daring punch.",
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": 2.875,
      "weightOz": 14.2,
      "weightLb": 0.1796875,
      "pack": 12,
      "caseHeight": "12 7/8\"",
      "caseWidth": "9 3/8\"",
      "caseLength": "12 1/4\"",
      "caseWeight": "32lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2440
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": 81.5048789125,
      "weightLb": 14.2,
      "pack": 0.1796875,
      "caseHeight": 32.7,
      "caseWidth": 23.81,
      "caseLength": 31.12,
      "caseWeight": 14.51,
      "palletCasesPerLayer": "32lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1106.76
    }
  },
  {
    "id": "white-sangria",
    "name": "White Sangria",
    "family": "Leelanau Cellars",
    "discontinued": false,
    "sourceRow": 108,
    "iriDescription": null,
    "upcFull": "0-84970-00099-1",
    "upc10": "8497000099",
    "gtin": "10084970000991",
    "meijerPid": "3710121",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "baco-noir-reserve",
    "name": "Baco Noir Reserve",
    "family": "Estate / Reserve",
    "discontinued": false,
    "sourceRow": 110,
    "iriDescription": null,
    "upcFull": "0-84970-02140-1",
    "upc10": "8497002140",
    "gtin": "10084970021408",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "meritage-reserve",
    "name": "Meritage Reserve",
    "family": "Estate / Reserve",
    "discontinued": false,
    "sourceRow": 111,
    "iriDescription": null,
    "upcFull": "0-84970-02110-4",
    "upc10": "8497002110",
    "gtin": "10084970021101",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "baco-noir-the-end",
    "name": "Baco Noir: The End",
    "family": "Estate / Reserve",
    "discontinued": false,
    "sourceRow": 112,
    "iriDescription": null,
    "upcFull": "0-84970-02155-5",
    "upc10": "8497002155",
    "gtin": "10084970021552",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "sweet-baco-noir",
    "name": "Sweet Baco Noir",
    "family": "Estate / Reserve",
    "discontinued": false,
    "sourceRow": 113,
    "iriDescription": null,
    "upcFull": "0-84970-08291-4",
    "upc10": "8497008291",
    "gtin": "10084970082911",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "cherry-cordial",
    "name": "Cherry Cordial",
    "family": "Dessert",
    "discontinued": false,
    "sourceRow": 114,
    "iriDescription": null,
    "upcFull": "0-84970-08282-2",
    "upc10": "8497008282",
    "gtin": "10084970082829",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "warm-cherry-cordial",
    "name": "Warm Cherry Cordial",
    "family": "Dessert",
    "discontinued": false,
    "sourceRow": 115,
    "iriDescription": null,
    "upcFull": "0-84970-08273-0",
    "upc10": "8497008273",
    "gtin": "10084970082737",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": 0,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "tall-ships-rose",
    "name": "Tall Ships Rose",
    "family": "Leelanau Cellars",
    "discontinued": true,
    "sourceRow": 119,
    "iriDescription": null,
    "upcFull": "0-84970-04376-1",
    "upc10": "8497004376",
    "gtin": "10084970043769",
    "meijerPid": "4446808",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "W65",
      "rs": 0.5,
      "abv": 12.5,
      "ph": 0,
      "ta": 7,
      "composition": "Barbara"
    },
    "marketingCopy": "This rose has a lovely color profile and subtle hints of strawberry and green apple.",
    "assets": [],
    "imperial": {
      "height": 11.875,
      "width": "2 7/8\"",
      "weightOz": 43,
      "weightLb": "#VALUE!",
      "pack": 12,
      "caseHeight": "12 1/8\"",
      "caseWidth": "9 1/2\"",
      "caseLength": "12 1/2\"",
      "caseWeight": "33.5lbs",
      "palletCasesPerLayer": 15,
      "palletLayers": 5,
      "palletHeight": "65 1/2\"",
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 2552
    },
    "metric": {
      "heightCm": "-",
      "widthCm": 30.1625,
      "weightGram": "-",
      "weightLb": 43,
      "pack": "-",
      "caseHeight": 30.8,
      "caseWidth": 24.13,
      "caseLength": 31.75,
      "caseWeight": 15.2,
      "palletCasesPerLayer": "33.5lbs",
      "palletLayers": 15,
      "palletHeight": 166.37,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 1157.57
    }
  },
  {
    "id": "harvest-pumpkin-spice",
    "name": "Harvest Pumpkin Spice",
    "family": "Seasonal",
    "discontinued": true,
    "sourceRow": 120,
    "iriDescription": null,
    "upcFull": "0-84970-02120-1",
    "upc10": "8497002120",
    "gtin": "10084970021200",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lwc-blueberry",
    "name": "LWC Blueberry",
    "family": "Leelanau Cellars",
    "discontinued": true,
    "sourceRow": 121,
    "iriDescription": null,
    "upcFull": "0-84970-07049-1",
    "upc10": "8497007049",
    "gtin": "10084970070499",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lwc-cherry",
    "name": "LWC Cherry",
    "family": "Leelanau Cellars",
    "discontinued": true,
    "sourceRow": 122,
    "iriDescription": null,
    "upcFull": "0-84970-00139-1",
    "upc10": "8497000139",
    "gtin": "10084970001394",
    "meijerPid": "506631",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lwc-cranberry",
    "name": "LWC Cranberry",
    "family": "Leelanau Cellars",
    "discontinued": true,
    "sourceRow": 123,
    "iriDescription": null,
    "upcFull": "0-84970-07048-1",
    "upc10": "8497007048",
    "gtin": "10084970070482",
    "meijerPid": "506637",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lwc-raspberry",
    "name": "LWC Raspberry",
    "family": "Leelanau Cellars",
    "discontinued": true,
    "sourceRow": 124,
    "iriDescription": null,
    "upcFull": "0-84970-03106-1",
    "upc10": "8497003106",
    "gtin": "10084970031063",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  },
  {
    "id": "lwc-chardonnay-bubbly",
    "name": "LWC Chardonnay Bubbly",
    "family": "Leelanau Cellars",
    "discontinued": true,
    "sourceRow": 125,
    "iriDescription": null,
    "upcFull": "0-84970-00109-1",
    "upc10": "8497000109",
    "gtin": "10084970001097",
    "meijerPid": null,
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "750 ML",
      "glassType": "0",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "0"
    },
    "marketingCopy": "0",
    "assets": [],
    "imperial": {
      "height": 0,
      "width": 0,
      "weightOz": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "lwc-cherry-port-dessert-wine",
    "name": "LWC Cherry Port Dessert Wine",
    "family": "Dessert",
    "discontinued": true,
    "sourceRow": 126,
    "iriDescription": null,
    "upcFull": "0-84970-04107-2",
    "upc10": "8497004107",
    "gtin": "10084970041079",
    "meijerPid": "4248244",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": "375 ML",
      "glassType": "0",
      "rs": 0,
      "abv": 0,
      "ph": 0,
      "ta": 0,
      "composition": "0"
    },
    "marketingCopy": "A port style wine fortified with brandy. Pair with chocolate and it tastes exactly like a chocolate covered cherry.",
    "assets": [],
    "imperial": {
      "height": 0,
      "width": 0,
      "weightOz": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": 0,
      "caseWidth": 0,
      "caseLength": 0,
      "caseWeight": 0,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": 0,
      "palletLength": 0,
      "palletWidth": 0,
      "palletWeight": 0
    }
  },
  {
    "id": "harvest-spiced-apple",
    "name": "Harvest Spiced Apple",
    "family": "Seasonal",
    "discontinued": true,
    "sourceRow": 127,
    "iriDescription": null,
    "upcFull": "0-84970-01021-1",
    "upc10": "8497001021",
    "gtin": "10084970010211",
    "meijerPid": "4756005",
    "targetDpci": null,
    "pricing": {
      "miCase": null,
      "miBottle": null,
      "miSrp": null,
      "ohCase": null,
      "ohBottle": null,
      "ohSrp": null
    },
    "specs": {
      "size": null,
      "glassType": null,
      "rs": null,
      "abv": null,
      "ph": null,
      "ta": null,
      "composition": null
    },
    "marketingCopy": null,
    "assets": [],
    "imperial": {
      "height": null,
      "width": null,
      "weightOz": null,
      "weightLb": null,
      "pack": null,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": null,
      "palletLayers": null,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    },
    "metric": {
      "heightCm": 0,
      "widthCm": 0,
      "weightGram": 0,
      "weightLb": 0,
      "pack": 0,
      "caseHeight": null,
      "caseWidth": null,
      "caseLength": null,
      "caseWeight": null,
      "palletCasesPerLayer": 0,
      "palletLayers": 0,
      "palletHeight": null,
      "palletLength": null,
      "palletWidth": null,
      "palletWeight": null
    }
  }
];
