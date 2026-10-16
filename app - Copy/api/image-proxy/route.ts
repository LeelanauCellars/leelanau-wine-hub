import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';

export const runtime = 'nodejs';

function blockedHostname(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '0.0.0.0' || host === '::1') return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  const match = host.match(/^172\.(\d+)\./);
  if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return true;
  if (/^169\.254\./.test(host)) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!await sessionRole()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) return NextResponse.json({ error: 'Missing image URL.' }, { status: 400 });

  let source: URL;
  try {
    source = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(source.protocol) || blockedHostname(source.hostname)) {
    return NextResponse.json({ error: 'Image URL is not allowed.' }, { status: 400 });
  }

  try {
    const response = await fetch(source, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Leelanau-Wine-Hub/1.0',
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Image request failed (${response.status}).` }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ error: 'The requested URL did not return an image.' }, { status: 415 });
    }

    const bytes = await response.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Unable to proxy image for color matching', error);
    return NextResponse.json({ error: 'Unable to load image.' }, { status: 502 });
  }
}
