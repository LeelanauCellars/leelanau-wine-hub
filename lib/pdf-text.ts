import { PDFParse } from 'pdf-parse';

export async function extractPdfText(bytes: ArrayBuffer | Uint8Array) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const parser = new PDFParse({ data });
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
