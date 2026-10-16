export async function extractPdfText(bytes: ArrayBuffer | Uint8Array) {
  // pdf-parse needs its worker/canvas support initialized explicitly in
  // serverless Next.js deployments. Import the worker first so Vercel does not
  // evaluate pdf-parse before DOMMatrix/Canvas support is available.
  const worker = await import('pdf-parse/worker');
  const { PDFParse } = await import('pdf-parse');

  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const parser = new PDFParse({ data, CanvasFactory: worker.CanvasFactory });
  try {
    const result = await parser.getText();
    return (result.text || '')
      .replace(/\u0000/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } finally {
    await parser.destroy();
  }
}
