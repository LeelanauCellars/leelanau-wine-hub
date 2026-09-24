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
