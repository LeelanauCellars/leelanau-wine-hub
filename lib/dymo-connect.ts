'use client';

export type DymoPrinter = {
  name: string;
  modelName?: string;
  printerType?: string;
  isConnected?: boolean;
  isLocal?: boolean;
};

export type DymoEnvironment = {
  ready: boolean;
  printers: DymoPrinter[];
  message: string;
};

const TEMPLATE_PATH = '/dymo/Leelanau-Merch-Price-Tag-30334.dymo';
const SCRIPT_URLS = [
  'https://qajavascriptsdktests.azurewebsites.net/JavaScript/dymo.connect.framework.js',
  'https://cdn.jsdelivr.net/gh/dymosoftware/dymo-connect-framework/dymo.connect.framework.js',
];

let templatePromise: Promise<string> | null = null;
let frameworkPromise: Promise<any> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dymoFramework() {
  return (window as any)?.dymo?.label?.framework;
}

function loadScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-dymo-framework="${url}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (dymoFramework()) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('DYMO Connect script failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.dymoFramework = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load DYMO Connect framework from ${url}`));
    document.head.appendChild(script);
  });
}

export async function ensureDymoFramework() {
  if (dymoFramework()) return dymoFramework();
  if (frameworkPromise) return frameworkPromise;

  frameworkPromise = (async () => {
    let lastError: unknown = null;
    for (const url of SCRIPT_URLS) {
      try {
        await loadScript(url);
        const framework = dymoFramework();
        if (framework) {
          try { framework.init?.(); } catch { /* framework can already be initialized */ }
          return framework;
        }
      } catch (error) {
        lastError = error;
      }
    }
    frameworkPromise = null;
    throw lastError instanceof Error ? lastError : new Error('DYMO Connect framework could not be loaded.');
  })();

  return frameworkPromise;
}

async function fetchPrinters(framework: any): Promise<DymoPrinter[]> {
  for (let attempt = 0; attempt < 7; attempt += 1) {
    try {
      const value = typeof framework.getPrintersAsync === 'function'
        ? await framework.getPrintersAsync()
        : await Promise.resolve(framework.getPrinters());
      const printers = Array.from(value || []) as DymoPrinter[];
      if (printers.length || attempt >= 3) return printers;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/discovery|progress|initializ/i.test(message) || attempt === 6) throw error;
    }
    await sleep(450);
  }
  return [];
}

export async function inspectDymoEnvironment(): Promise<DymoEnvironment> {
  try {
    const framework = await ensureDymoFramework();
    const printers = await fetchPrinters(framework);
    if (!printers.length) {
      return {
        ready: false,
        printers: [],
        message: 'DYMO Connect is available, but no DYMO printers were found.',
      };
    }
    return {
      ready: true,
      printers,
      message: `${printers.length} DYMO printer${printers.length === 1 ? '' : 's'} found`,
    };
  } catch (error) {
    return {
      ready: false,
      printers: [],
      message: error instanceof Error ? error.message : 'DYMO Connect could not be reached.',
    };
  }
}

async function getTemplateXml() {
  if (!templatePromise) {
    templatePromise = fetch(TEMPLATE_PATH, { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('DYMO 30334 template could not be loaded.');
      return response.text();
    });
  }
  return templatePromise;
}

export type DymoLabelRecord = {
  price: string;
  upc: string;
  sku: string;
};

export async function printDymoRecords(printerName: string, records: DymoLabelRecord[]) {
  if (!printerName) throw new Error('Choose a DYMO printer first.');
  if (!records.length) return;

  const [framework, labelXml] = await Promise.all([ensureDymoFramework(), getTemplateXml()]);
  const label = framework.openLabelXml(labelXml);

  if (typeof label.isValidLabel === 'function' && !label.isValidLabel()) {
    throw new Error('The DYMO 30334 template was not accepted by DYMO Connect.');
  }

  if (records.length === 1) {
    label.setObjectText('PRICE', records[0].price);
    label.setObjectText('UPC', records[0].upc);
    label.setObjectText('SKU', records[0].sku);
    label.print(printerName);
    return;
  }

  if (typeof framework.LabelSetBuilder === 'function') {
    const builder = new framework.LabelSetBuilder();
    for (const record of records) {
      const labelRecord = builder.addRecord();
      labelRecord.setText('PRICE', record.price);
      labelRecord.setText('UPC', record.upc);
      labelRecord.setText('SKU', record.sku);
    }
    label.print(printerName, '', builder.toString());
    return;
  }

  // Fallback for older DYMO framework builds without LabelSetBuilder.
  for (const record of records) {
    const copy = framework.openLabelXml(labelXml);
    copy.setObjectText('PRICE', record.price);
    copy.setObjectText('UPC', record.upc);
    copy.setObjectText('SKU', record.sku);
    copy.print(printerName);
    await sleep(60);
  }
}
