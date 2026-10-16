export type MerchCategory = 'Hoodies' | 'Shirts' | 'Hats' | 'Glassware' | 'Accessories' | 'Other';

export type MerchVariant = {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  upcCode: string;
  price: number | null;
  inventory: number | null;
};

export type MerchProduct = {
  id: string;
  name: string;
  image?: string;
  images: string[];
  type?: string;
  collection?: string;
  category: MerchCategory;
  variants: MerchVariant[];
};
