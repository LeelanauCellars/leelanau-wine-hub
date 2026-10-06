import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { sessionRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MAX_INPUT_BYTES = 4 * 1024 * 1024;
const OUTPUT_SIZE = 2048;

function allowedRole(role: string | null): role is 'admin' | 'tasting' {
  return role === 'admin' || role === 'tasting';
}

type ImageBlock = { type?: string; data?: string; mime_type?: string; mimeType?: string };
type InteractionResponse = {
  status?: string;
  output_image?: { data?: string; mime_type?: string };
  steps?: Array<{ type?: string; content?: ImageBlock[] }>;
  error?: { message?: string };
};

function findOutputImage(payload: InteractionResponse) {
  if (payload.output_image?.data) return { data: payload.output_image.data, mimeType: payload.output_image.mime_type || 'image/jpeg' };
  for (const step of [...(payload.steps || [])].reverse()) {
    for (const block of [...(step.content || [])].reverse()) {
      if (block.type === 'image' && block.data) return { data: block.data, mimeType: block.mime_type || block.mimeType || 'image/jpeg' };
    }
  }
  return null;
}

function colorDistanceSquared(r: number, g: number, b: number, bg: [number, number, number]) {
  const dr = r - bg[0];
  const dg = g - bg[1];
  const db = b - bg[2];
  return dr * dr + dg * dg + db * db;
}

function sampleCornerBackground(data: Uint8ClampedArray, width: number, height: number): [number, number, number] {
  const sample = Math.max(4, Math.min(24, Math.floor(Math.min(width, height) * 0.02)));
  let r = 0; let g = 0; let b = 0; let count = 0;
  const corners = [
    [0, 0], [width - sample, 0], [0, height - sample], [width - sample, height - sample],
  ];
  for (const [sx, sy] of corners) {
    for (let y = sy; y < sy + sample; y += 1) {
      for (let x = sx; x < sx + sample; x += 1) {
        const offset = (y * width + x) * 4;
        r += data[offset]; g += data[offset + 1]; b += data[offset + 2]; count += 1;
      }
    }
  }
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

async function createTransparent2048(source: Buffer) {
  const image = await loadImage(source);
  const width = image.width;
  const height = image.height;
  if (!width || !height) throw new Error('Gemini returned an unreadable image.');

  const work = createCanvas(width, height);
  const ctx = work.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const background = sampleCornerBackground(data, width, height);
  const threshold = 122 * 122;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const tryQueue = (index: number) => {
    if (visited[index]) return;
    const offset = index * 4;
    if (colorDistanceSquared(data[offset], data[offset + 1], data[offset + 2], background) > threshold) return;
    visited[index] = 1;
    queue[tail] = index;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    tryQueue(x);
    tryQueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    tryQueue(y * width);
    tryQueue(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) tryQueue(index - 1);
    if (x + 1 < width) tryQueue(index + 1);
    if (y > 0) tryQueue(index - width);
    if (y + 1 < height) tryQueue(index + width);
  }

  let minX = width; let minY = height; let maxX = -1; let maxY = -1;
  let removed = 0;
  for (let index = 0; index < visited.length; index += 1) {
    const offset = index * 4;
    if (visited[index]) {
      data[offset + 3] = 0;
      removed += 1;
      continue;
    }
    if (data[offset + 3] > 10) {
      const x = index % width;
      const y = Math.floor(index / width);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const removedRatio = removed / visited.length;
  if (removedRatio < 0.08 || maxX < minX || maxY < minY) {
    throw new Error('The AI cleanup finished, but Central could not reliably isolate the product from the background. Try a photo with the full product clearly visible against a plain background.');
  }

  ctx.putImageData(imageData, 0, 0);
  const bboxWidth = maxX - minX + 1;
  const bboxHeight = maxY - minY + 1;
  const targetMax = Math.round(OUTPUT_SIZE * 0.84);
  const scale = Math.min(targetMax / bboxWidth, targetMax / bboxHeight);
  const drawWidth = Math.max(1, Math.round(bboxWidth * scale));
  const drawHeight = Math.max(1, Math.round(bboxHeight * scale));
  const dx = Math.round((OUTPUT_SIZE - drawWidth) / 2);
  const dy = Math.round((OUTPUT_SIZE - drawHeight) / 2);

  const output = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
  const out = output.getContext('2d');
  out.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  out.drawImage(work, minX, minY, bboxWidth, bboxHeight, dx, dy, drawWidth, drawHeight);
  return await output.encode('png');
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!allowedRole(role)) return NextResponse.json({ error: role ? 'Image Upload to Commerce7 is available to Admin and Tasting Room access.' : 'Unauthorized' }, { status: role ? 403 : 401 });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: 'Gemini is not configured. Add GEMINI_API_KEY in Vercel.' }, { status: 503 });

  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: 'Choose a product image.' }, { status: 400 });
  if (!/^image\/(?:png|jpeg|webp)$/i.test(file.type)) return NextResponse.json({ error: 'Use a JPG, PNG, or WebP image.' }, { status: 415 });
  if (file.size > MAX_INPUT_BYTES) return NextResponse.json({ error: 'The prepared image is too large. Try the upload again from Central so it can resize the photo first.' }, { status: 413 });

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const model = process.env.PRODUCT_IMAGE_GEMINI_MODEL?.trim() || 'gemini-3.1-flash-image';
    const prompt = `Create a professional ecommerce product cutout from this exact uploaded product photograph.

Preserve the product identity exactly: its true color, logo, printed or embroidered artwork, text, seams, trim, closures, pockets, proportions, and distinctive design details. Do not invent, redesign, replace, or remove branding. Do not add new text or logos.

Clean up the presentation like a professional catalog photo: gently reduce wrinkles and uneven folds, improve symmetry, straighten the product, correct minor lighting issues, and present the item front-facing and realistic. Keep natural fabric/material texture. Do not make the product look plastic or illustrated.

Remove all people, hands, hangers, tables, props, scenery, floor, and external shadows. Place only the product centered in a square composition with comfortable padding.

CRITICAL FOR BACKGROUND REMOVAL: render the entire background as one perfectly flat, uniform chroma-key green #00FF00 (RGB 0,255,0), edge-to-edge, with no gradient, texture, floor, or shadow outside the product. The green is temporary and will be removed automatically after generation.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        model,
        input: [
          { type: 'image', mime_type: file.type, data: bytes.toString('base64') },
          { type: 'text', text: prompt },
        ],
        response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '1:1', image_size: '2K', delivery: 'inline' },
        generation_config: { thinking_level: 'high' },
        store: false,
      }),
    });

    const payload = await response.json() as InteractionResponse;
    if (!response.ok) {
      const message = payload.error?.message || `Gemini returned ${response.status}`;
      throw new Error(message);
    }
    const generated = findOutputImage(payload);
    if (!generated) throw new Error('Gemini completed the request but did not return an edited image.');

    const transparent = await createTransparent2048(Buffer.from(generated.data, 'base64'));
    const safeBase = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'product';
    const pathname = `commerce7-product-images/drafts/${Date.now()}-${safeBase}.png`;
    const blob = await put(pathname, transparent, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'image/png',
      cacheControlMaxAge: 60,
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      format: 'PNG',
      transparent: true,
      model,
    });
  } catch (error) {
    console.error('Product image processing failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process the product image.' }, { status: 502 });
  }
}
