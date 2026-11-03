import type { PdfStockPage } from '@/lib/stock-inventory';

/** Extract positioned text from a PDF to avoid pdf-parse's reading-order issue
 * with the landscape/rotated warehouse Stock Status by CC and LOC report. */
export async function readStockPdfPages(bytes: Uint8Array): Promise<PdfStockPage[]> {
  // Install the Node canvas polyfills before pdfjs evaluates in Next/Vercel.
  await import('pdf-parse/worker');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = bytes.slice();
  const loadingTask = pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false });
  const document = await loadingTask.promise;
  try {
    if (document.numPages > 250) throw new Error('Please upload a stock report with 250 pages or fewer.');
    const pages: PdfStockPage[] = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent({ disableNormalization: false });
      const words = content.items.flatMap((item) => {
        if (!('str' in item) || !item.str.trim() || !('transform' in item)) return [];
        const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        return [{ text: item.str, x, y }];
      });
      pages.push({ page: number, words });
      page.cleanup();
    }
    return pages;
  } finally {
    await document.destroy();
  }
}
