import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { sessionRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_INPUT_BYTES = 4 * 1024 * 1024;
const OUTPUT_SIZE = 2048;
const TARGET_FILL = 0.84;

type RGB = [number, number, number];

type PaletteEntry = {
  rgb: RGB;
  count: number;
};

function allowedRole(role: string | null): role is 'admin' | 'tasting' {
  return role === 'admin' || role === 'tasting';
}

function colorDistanceSquared(r: number, g: number, b: number, color: RGB) {
  const dr = r - color[0];
  const dg = g - color[1];
  const db = b - color[2];
  // Human vision is a little more sensitive to green. This is still fast
  // enough to run across a phone photo in a serverless function.
  return dr * dr * 0.30 + dg * dg * 0.59 + db * db * 0.11;
}

function minPaletteDistanceSquared(r: number, g: number, b: number, palette: PaletteEntry[]) {
  let best = Number.POSITIVE_INFINITY;
  for (const entry of palette) {
    const distance = colorDistanceSquared(r, g, b, entry.rgb);
    if (distance < best) best = distance;
  }
  return best;
}

function buildEdgePalette(data: Uint8ClampedArray, width: number, height: number) {
  const bins = new Map<string, { r: number; g: number; b: number; count: number }>();
  const step = Math.max(1, Math.floor(Math.min(width, height) / 220));
  const band = Math.max(2, Math.min(12, Math.floor(Math.min(width, height) * 0.012)));
  let total = 0;

  const sample = (x: number, y: number) => {
    const offset = (y * width + x) * 4;
    if (data[offset + 3] < 32) return;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    // 16-level quantization groups gentle lighting/shadow differences while
    // still keeping clearly different product colors separate.
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const current = bins.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    current.r += r;
    current.g += g;
    current.b += b;
    current.count += 1;
    bins.set(key, current);
    total += 1;
  };

  for (let y = 0; y < band; y += step) {
    for (let x = 0; x < width; x += step) {
      sample(x, y);
      sample(x, height - 1 - y);
    }
  }
  for (let x = 0; x < band; x += step) {
    for (let y = band; y < height - band; y += step) {
      sample(x, y);
      sample(width - 1 - x, y);
    }
  }

  const ranked = [...bins.values()].sort((a, b) => b.count - a.count);
  const palette: PaletteEntry[] = [];
  let covered = 0;
  // Use the dominant edge colors rather than a single corner average. This
  // copes much better with mild wall/floor gradients and ordinary shadows.
  for (const bin of ranked) {
    if (palette.length >= 7) break;
    if (bin.count < Math.max(2, total * 0.015)) break;
    palette.push({
      rgb: [Math.round(bin.r / bin.count), Math.round(bin.g / bin.count), Math.round(bin.b / bin.count)],
      count: bin.count,
    });
    covered += bin.count;
    if (palette.length >= 2 && covered >= total * 0.78) break;
  }

  if (!palette.length && ranked[0]) {
    const bin = ranked[0];
    palette.push({ rgb: [Math.round(bin.r / bin.count), Math.round(bin.g / bin.count), Math.round(bin.b / bin.count)], count: bin.count });
  }
  return palette;
}

function createBackgroundMask(data: Uint8ClampedArray, width: number, height: number, palette: PaletteEntry[]) {
  const pixelCount = width * height;
  const background = new Uint8Array(pixelCount);
  const queued = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  // A generous threshold works because only pixels connected to the outside
  // edge are removed. Similar colors enclosed inside the product remain safe.
  const seedThreshold = 62 * 62;
  const growThreshold = 78 * 78;
  const localThreshold = 34 * 34;

  const paletteDistance = (index: number) => {
    const offset = index * 4;
    return minPaletteDistanceSquared(data[offset], data[offset + 1], data[offset + 2], palette);
  };

  const queueSeed = (index: number) => {
    if (queued[index]) return;
    if (paletteDistance(index) > seedThreshold) return;
    queued[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    queueSeed(x);
    queueSeed((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    queueSeed(y * width);
    queueSeed(y * width + width - 1);
  }

  const tryGrow = (from: number, next: number) => {
    if (queued[next]) return;
    const nextDistance = paletteDistance(next);
    if (nextDistance > growThreshold) return;

    const a = from * 4;
    const b = next * 4;
    const local = colorDistanceSquared(data[a], data[a + 1], data[a + 2], [data[b], data[b + 1], data[b + 2]] as RGB);
    // Either strongly resembles the outside palette, or changes gradually from
    // a background pixel. This follows normal shadows without crossing a hard
    // product edge.
    if (nextDistance > seedThreshold && local > localThreshold) return;
    queued[next] = 1;
    queue[tail++] = next;
  };

  while (head < tail) {
    const index = queue[head++];
    background[index] = 1;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) tryGrow(index, index - 1);
    if (x + 1 < width) tryGrow(index, index + 1);
    if (y > 0) tryGrow(index, index - width);
    if (y + 1 < height) tryGrow(index, index + width);
  }

  return background;
}

function softenEdges(data: Uint8ClampedArray, width: number, height: number, background: Uint8Array, palette: PaletteEntry[]) {
  const softThreshold = 98 * 98;
  const hardThreshold = 58 * 58;
  const nextAlpha = new Uint8Array(width * height);

  for (let index = 0; index < background.length; index += 1) {
    if (background[index]) {
      nextAlpha[index] = 0;
      continue;
    }

    const x = index % width;
    const y = Math.floor(index / width);
    let touchesBackground = false;
    for (let dy = -1; dy <= 1 && !touchesBackground; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (background[ny * width + nx]) { touchesBackground = true; break; }
      }
    }

    if (!touchesBackground) {
      nextAlpha[index] = data[index * 4 + 3];
      continue;
    }

    const offset = index * 4;
    const distance = minPaletteDistanceSquared(data[offset], data[offset + 1], data[offset + 2], palette);
    if (distance <= hardThreshold) {
      nextAlpha[index] = 0;
    } else if (distance < softThreshold) {
      const t = (distance - hardThreshold) / (softThreshold - hardThreshold);
      nextAlpha[index] = Math.max(0, Math.min(255, Math.round(255 * t)));
    } else {
      nextAlpha[index] = data[offset + 3];
    }
  }

  for (let index = 0; index < nextAlpha.length; index += 1) data[index * 4 + 3] = nextAlpha[index];
}

function findVisibleBounds(data: Uint8ClampedArray, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let visible = 0;
  for (let index = 0; index < width * height; index += 1) {
    if (data[index * 4 + 3] <= 18) continue;
    visible += 1;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, visible };
}

async function createTransparent2048(source: Buffer) {
  const image = await loadImage(source);
  const width = image.width;
  const height = image.height;
  if (!width || !height) throw new Error('Central could not read that image.');

  const work = createCanvas(width, height);
  const ctx = work.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const palette = buildEdgePalette(data, width, height);
  if (!palette.length) throw new Error('Central could not identify the photo background. Try a product photo against a plain, contrasting background.');

  const mask = createBackgroundMask(data, width, height, palette);
  let removed = 0;
  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index]) continue;
    data[index * 4 + 3] = 0;
    removed += 1;
  }
  softenEdges(data, width, height, mask, palette);

  const removedRatio = removed / mask.length;
  const bounds = findVisibleBounds(data, width, height);
  const visibleRatio = bounds.visible / mask.length;
  if (removedRatio < 0.035 || visibleRatio < 0.01 || bounds.maxX < bounds.minX || bounds.maxY < bounds.minY) {
    throw new Error('Central could not reliably separate the product from the background. Retake the photo with the whole item visible against a plain background that contrasts with the product.');
  }
  if (visibleRatio > 0.94) {
    throw new Error('The product is too close to the edge for a clean automatic cutout. Retake the photo with some empty background around the entire item.');
  }

  ctx.putImageData(imageData, 0, 0);
  const bboxWidth = bounds.maxX - bounds.minX + 1;
  const bboxHeight = bounds.maxY - bounds.minY + 1;
  const targetMax = Math.round(OUTPUT_SIZE * TARGET_FILL);
  const scale = Math.min(targetMax / bboxWidth, targetMax / bboxHeight);
  const drawWidth = Math.max(1, Math.round(bboxWidth * scale));
  const drawHeight = Math.max(1, Math.round(bboxHeight * scale));
  const dx = Math.round((OUTPUT_SIZE - drawWidth) / 2);
  const dy = Math.round((OUTPUT_SIZE - drawHeight) / 2);

  const output = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
  const out = output.getContext('2d');
  out.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  out.imageSmoothingEnabled = true;
  out.drawImage(work, bounds.minX, bounds.minY, bboxWidth, bboxHeight, dx, dy, drawWidth, drawHeight);
  return output.encode('png');
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!allowedRole(role)) return NextResponse.json({ error: role ? 'Image Upload to Commerce7 is available to Admin and Tasting Room access.' : 'Unauthorized' }, { status: role ? 403 : 401 });

  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: 'Choose a product image.' }, { status: 400 });
  if (!/^image\/(?:png|jpeg|webp)$/i.test(file.type)) return NextResponse.json({ error: 'Use a JPG, PNG, or WebP image.' }, { status: 415 });
  if (file.size > MAX_INPUT_BYTES) return NextResponse.json({ error: 'The prepared image is too large. Try the upload again from Central so it can resize the photo first.' }, { status: 413 });

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const transparent = await createTransparent2048(bytes);
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
      engine: 'Central Standard Cleanup',
    });
  } catch (error) {
    console.error('Product image processing failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process the product image.' }, { status: 422 });
  }
}
