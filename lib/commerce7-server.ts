export type Commerce7ProductBase = {
  id: string;
  title?: string | null;
  type?: string | null;
  adminStatus?: string | null;
  webStatus?: string | null;
};

export function commerce7Config() {
  const appId = process.env.COMMERCE7_APP_ID?.trim() || '';
  const secret = process.env.COMMERCE7_APP_SECRET?.trim() || '';
  const tenant = process.env.COMMERCE7_TENANT_ID?.trim() || '';
  return {
    appId,
    secret,
    tenant,
    configured: Boolean(appId && secret && tenant),
  };
}

export async function fetchCommerce7Products<T extends Commerce7ProductBase = Commerce7ProductBase>(options?: {
  adminStatus?: string;
  limit?: number;
  maxPages?: number;
}) {
  const { appId, secret, tenant, configured } = commerce7Config();
  if (!configured) throw new Error('Commerce7 is not configured');

  const limit = options?.limit ?? 50;
  const maxPages = options?.maxPages ?? 100;
  const adminStatus = options?.adminStatus ?? 'Available';
  const auth = Buffer.from(`${appId}:${secret}`).toString('base64');
  const products: T[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (products.length < total && page <= maxPages) {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      adminStatus,
    });
    const response = await fetch(`https://api.commerce7.com/v1/product?${query.toString()}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        tenant,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Commerce7 returned ${response.status}: ${message.slice(0, 250)}`);
    }

    const data = await response.json() as { products?: T[]; total?: number };
    const batch = data.products ?? [];
    products.push(...batch);
    total = data.total ?? products.length;
    if (!batch.length) break;
    page += 1;
  }

  return { products, total: Number.isFinite(total) ? total : products.length, tenant };
}
export async function fetchCommerce7VendorTitles(vendorIds: string[]) {
  const { appId, secret, tenant, configured } = commerce7Config();
  if (!configured) return {} as Record<string, string>;

  const ids = Array.from(new Set(vendorIds.filter(Boolean)));
  if (!ids.length) return {} as Record<string, string>;

  const auth = Buffer.from(`${appId}:${secret}`).toString('base64');
  const entries = await Promise.all(ids.map(async (id) => {
    try {
      const response = await fetch(`https://api.commerce7.com/v1/vendor/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Basic ${auth}`,
          tenant,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (!response.ok) return null;
      const data = await response.json() as { vendor?: { id?: string; title?: string | null } };
      const title = data.vendor?.title?.trim();
      return title ? [id, title] as const : null;
    } catch {
      return null;
    }
  }));

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry)));
}

export type Commerce7OrderItem = {
  id?: string | null;
  productTitle?: string | null;
  type?: string | null;
  productId?: string | null;
  productVariantTitle?: string | null;
  productVariantId?: string | null;
  sku?: string | null;
  price?: number | null;
  quantity?: number | null;
  volumeInML?: number | null;
};

export type Commerce7Order = {
  id?: string | null;
  orderSubmittedDate?: string | null;
  orderPaidDate?: string | null;
  orderNumber?: string | number | null;
  previousOrderId?: string | null;
  previousOrderNumber?: string | number | null;
  refundOrderId?: string | null;
  refundOrderNumber?: string | number | null;
  purchaseType?: string | null;
  paymentStatus?: string | null;
  channel?: string | null;
  posProfileId?: string | null;
  items?: Commerce7OrderItem[] | null;
};

export async function fetchCommerce7Orders(options?: {
  channel?: 'Inbound' | 'Web' | 'POS' | 'Club';
  orderSubmittedDate?: string;
  maxPages?: number;
}) {
  const { appId, secret, tenant, configured } = commerce7Config();
  if (!configured) throw new Error('Commerce7 is not configured');

  const auth = Buffer.from(`${appId}:${secret}`).toString('base64');
  const orders: Commerce7Order[] = [];
  const maxPages = options?.maxPages ?? 200;
  let cursor = 'start';
  let page = 0;

  while (cursor && page < maxPages) {
    page += 1;
    const query = new URLSearchParams({ cursor });
    if (options?.channel) query.set('channel', options.channel);
    if (options?.orderSubmittedDate) query.set('orderSubmittedDate', options.orderSubmittedDate);

    const response = await fetch(`https://api.commerce7.com/v1/order?${query.toString()}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        tenant,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new Error('Commerce7 rejected Order access. Add Order → Read to the Central app version in the Commerce7 App Development Center, update/reinstall that version for Leelanau Cellars, then try the sync again.');
      }
      throw new Error(`Commerce7 Orders returned ${response.status}: ${message.slice(0, 250)}`);
    }

    const data = await response.json() as { orders?: Commerce7Order[]; cursor?: string | null; total?: number };
    orders.push(...(data.orders ?? []));
    cursor = data.cursor || '';
  }

  if (cursor) throw new Error('Commerce7 returned more POS order pages than Central could safely process in one sync. Narrow the sync period and try again.');
  return { orders, tenant };
}
