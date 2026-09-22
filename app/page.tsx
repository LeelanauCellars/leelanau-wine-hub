'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { SEED_WINES } from '@/lib/seed';
import type { Award, TechSheetDraft, WineRecord } from '@/lib/types';
import { casePackagingForWine } from '@/lib/case-packaging';
import { lifestyleAssetsForWine } from '@/lib/lifestyle-assets';
import { normalizeUpcA, upcASvg, upcASvgDataUrl } from '@/lib/upc';
import { CURRENT_TASTING_MENU_LABEL, CURRENT_TASTING_MENU_TEXT, CURRENT_TASTING_MENU_VERSION, QUICK_FACTS } from '@/lib/tasting-room-content';

type IconProps = React.SVGProps<SVGSVGElement>;
const Icon = ({ children, ...props }: IconProps) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
const Search = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const AwardIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="5"/><path d="m8.5 12.5-2 8 5.5-3 5.5 3-2-8"/></Icon>;
const Check = (p: IconProps) => <Icon {...p}><path d="m5 12 4 4L19 6"/></Icon>;
const ChevronLeft = (p: IconProps) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const ClipboardList = (p: IconProps) => <Icon {...p}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></Icon>;
const Database = (p: IconProps) => <Icon {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></Icon>;
const Download = (p: IconProps) => <Icon {...p}><path d="M12 3v12m-4-4 4 4 4-4M5 20h14"/></Icon>;
const ExternalLink = (p: IconProps) => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M19 13v6H5V5h6"/></Icon>;
const FileText = (p: IconProps) => <Icon {...p}><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6"/></Icon>;
const ImageIcon = (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 20"/></Icon>;
const Library = (p: IconProps) => <Icon {...p}><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 4l4 1v15l-4-1z"/></Icon>;
const Loader2 = (p: IconProps) => <Icon {...p}><path d="M21 12a9 9 0 1 1-6.2-8.6"/></Icon>;
const Menu = (p: IconProps) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16"/></Icon>;
const Lock = (p: IconProps) => <Icon {...p}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon>;
const LogOut = (p: IconProps) => <Icon {...p}><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/></Icon>;
const BookOpen = (p: IconProps) => <Icon {...p}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22zM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z"/></Icon>;
const Upload = (p: IconProps) => <Icon {...p}><path d="M12 16V4m-4 4 4-4 4 4M5 20h14"/></Icon>;
const Pencil = (p: IconProps) => <Icon {...p}><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7 17 10.5"/></Icon>;
const Plus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const Printer = (p: IconProps) => <Icon {...p}><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></Icon>;
const RefreshCw = (p: IconProps) => <Icon {...p}><path d="M20 6v5h-5M4 18v-5h5M18.5 11A7 7 0 0 0 6 7.5L4 11M5.5 13A7 7 0 0 0 18 16.5L20 13"/></Icon>;
const Save = (p: IconProps) => <Icon {...p}><path d="M4 3h14l2 2v16H4zM8 3v6h8V3M8 21v-7h8v7"/></Icon>;
const X = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>;

type AccessRole = 'admin' | 'sales' | 'tasting';
type View = 'library' | 'profile' | 'tasting' | 'quickfacts' | 'tech' | 'awards' | 'assets';
type ProfileTab = 'overview' | 'sales' | 'specs' | 'assets';

type SyncState = {
  configured: boolean;
  loading: boolean;
  message: string;
  lastSynced?: string;
};

const STORAGE_KEY = 'lwc-wine-hub-v2';
const MENU_KEY = 'lwc-wine-hub-tasting-menu-v1';
const MENU_VERSION_KEY = 'lwc-wine-hub-tasting-menu-version-v1';
const TECH_COLOR = '#5BA3F8';
const TECH_LIGHT = '#BDDAFC';
const FOOTER = 'Leelanau Cellars | 231-386-5201 | sales@lwc.wine | lwc.wine';

const normalize = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const money = (value?: number) => value === undefined ? '—' : `$${value.toFixed(2)}`;
const safeArray = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const formatUpc = (value = '') => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12) return `${digits.slice(0, 1)}-${digits.slice(1, 6)}-${digits.slice(6, 11)}-${digits.slice(11)}`;
  return value;
};

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formattedCopyHtml(value = '') {
  const hasRichMarkup = /<\/?(?:strong|b|u|mark|br)\b/i.test(value);
  let html = hasRichMarkup ? value : escapeHtml(value);

  // Keep only the small set of inline tags that the tech-sheet editor creates.
  if (hasRichMarkup) {
    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<(?!\/?(?:strong|b|u|mark|br)\b)[^>]*>/gi, '')
      .replace(/<(strong|b|u)\b[^>]*>/gi, '<$1>')
      .replace(/<mark\b[^>]*>/gi, '<mark style="background:#fff1a8;color:inherit;padding:0 .08em;border-radius:.08em;-webkit-box-decoration-break:clone;box-decoration-break:clone">')
      .replace(/<br\b[^>]*>/gi, '<br />');
  }

  // Continue supporting sheets created with the older marker-based formatter.
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
  html = html.replace(/==([\s\S]+?)==/g, '<mark style="background:#fff1a8;color:inherit;padding:0 .08em;border-radius:.08em;-webkit-box-decoration-break:clone;box-decoration-break:clone">$1</mark>');
  return html.replace(/\n/g, '<br />');
}

function FormattedCopy({ text, className = '' }: { text: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: formattedCopyHtml(text) }} />;
}

function plainFormattedText(value = '') {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*|__|==/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .trim();
}

function splitRichLines(value = '') {
  return value
    .replace(/\r/g, '')
    .split(/(?:<br\s*\/?>|\n)+/i)
    .map((item) => item.trim())
    .filter((item) => plainFormattedText(item));
}

const cleanSentence = (value = '') => value.replace(/^\s*(?:flavor profile|tasting notes?|aroma|palate|taste|texture|finish|style|the flavor|flavor|notes?)\s*:\s*/i, '').replace(/\s+/g, ' ').trim();

function shortenToWords(value: string, max = 175) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max + 1);
  const sentenceCut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  if (sentenceCut > max * .58) return slice.slice(0, sentenceCut + 1).trim();
  const cut = slice.lastIndexOf(' ');
  const shortened = slice.slice(0, cut > max * .65 ? cut : max).replace(/[,:;\-–—\s]+$/g, '');
  return `${shortened}.`;
}

const sensoryTerms = [
  'apple', 'apricot', 'berry', 'blackberry', 'blueberry', 'cherry', 'cranberry', 'citrus', 'grape', 'lemon', 'lime', 'mango', 'melon', 'orange', 'peach', 'pear', 'pineapple', 'plum', 'raspberry', 'strawberry', 'tropical',
  'cinnamon', 'clove', 'cloves', 'ginger', 'nutmeg', 'spice', 'spiced', 'pumpkin', 'brown sugar', 'vanilla', 'chocolate', 'caramel', 'honey', 'floral', 'flower', 'honeysuckle', 'cedar', 'oak', 'smoke', 'earthy',
  'aroma', 'palate', 'flavor', 'taste', 'finish', 'mouthfeel', 'texture', 'tannin', 'acidity', 'effervescence', 'bubbles', 'bubbly', 'sparkling',
  'sweet', 'semi-sweet', 'semi-dry', 'dry', 'crisp', 'tart', 'juicy', 'jammy', 'bright', 'smooth', 'creamy', 'rich', 'light-bodied', 'full-bodied', 'refreshing', 'savory', 'fruity', 'fruit-forward', 'soft', 'velvety', 'warming', 'warm',
];

const marketingTerms = [
  'official', 'tradition', 'celebration', 'award', 'winner', 'perfect for', 'occasion', 'party', 'gathering', 'stockpile', 'customers', 'purchase', 'benefits', 'support',
];

const servingTerms = [
  'enjoy', 'serve', 'served', 'chilled', 'room temperature', 'warm', 'warmed', 'hot', 'over ice', 'crockpot', 'cocktail', 'mug',
];

function sensoryScore(value: string) {
  const normalized = value.toLowerCase().replace(/[’‘]/g, "'");
  let score = 0;
  for (const term of sensoryTerms) if (normalized.includes(term)) score += term.includes(' ') ? 2 : 1;
  for (const term of marketingTerms) if (normalized.includes(term)) score -= 1;
  if (/^(?:flavor profile|aroma|palate|taste|texture|finish|style|tasting notes?)\s*:/i.test(value.trim())) score += 4;
  return score;
}

function sentenceParts(value = '') {
  return value
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'])/)
    .map((part) => cleanSentence(part))
    .filter((part) => part.length > 18);
}

function cleanCommerce7Copy(value = '') {
  return value
    .replace(/^\s*#{1,6}\s*/, '')
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/__+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function simplifySalesSentence(value = '') {
  return cleanCommerce7Copy(value)
    .replace(/^\s*(?:incredible|amazing|ultimate)\s+versatility\s*:\s*/i, '')
    .replace(/^\s*versatility\s*:\s*/i, '')
    .replace(/\b(?:incredibly|deeply|wonderfully|beautifully|delightfully|perfectly)\b\s*/gi, '')
    .replace(/\ba heartwarming medley of\b/gi, '')
    .replace(/\bheartwarming medley of\b/gi, '')
    .replace(/\brich\s+(?=cinnamon|clove|ginger|nutmeg)/gi, '')
    .replace(/\bearthy\s+(?=cinnamon|clove|ginger|nutmeg)/gi, '')
    .replace(/\bzesty\s+(?=cinnamon|clove|ginger|nutmeg)/gi, '')
    .replace(/\bversatile sweet red blend\b/gi, 'versatile red blend')
    .replace(/\bclassic spices:\s*/gi, 'classic spices of ')
    .replace(/\bchilled on a warm [^,.!?]*(?:afternoon|day)\b/gi, 'chilled')
    .replace(/\bin a mug on a chilly [^,.!?]*(?:night|evening)\b/gi, 'in a mug')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function firstUsefulOpening(wine: WineRecord) {
  const source = wine.tastingNotes || wine.shortDescription || wine.commerce7CopyLines?.[0] || '';
  return sentenceParts(cleanCommerce7Copy(source))[0] || cleanCommerce7Copy(source);
}

function servingScore(value: string) {
  const lower = value.toLowerCase();
  return servingTerms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
}

function shortCommerce7TastingNotes(wine?: WineRecord) {
  if (!wine) return '';

  const rawCandidates = [
    ...(wine.commerce7CopyLines || []),
    ...(wine.highlights || []),
    wine.tastingNotes || '',
    wine.shortDescription || '',
  ].filter(Boolean);

  const candidates = rawCandidates
    .flatMap((line) => sentenceParts(cleanCommerce7Copy(line)))
    .map((text, index) => ({ text: simplifySalesSentence(text), index }))
    .filter(({ text }) => text.length > 18)
    .filter(({ text }, index, array) => array.findIndex((candidate) => normalize(candidate.text) === normalize(text)) === index)
    .map((candidate) => ({ ...candidate, sensory: sensoryScore(candidate.text), serving: servingScore(candidate.text) }));

  const opening = simplifySalesSentence(firstUsefulOpening(wine));
  const openingKey = normalize(opening);

  // The sales-sheet pattern is intentionally different from a conventional tasting note:
  // 1) a short positioning sentence, 2) the clearest flavor sentence, 3) a useful serve/enjoy sentence when Commerce7 provides one.
  const flavor = candidates
    .filter((candidate) => normalize(candidate.text) !== openingKey && candidate.sensory >= 2)
    .sort((a, b) => b.sensory - a.sensory || a.index - b.index)[0]?.text || '';

  const serving = candidates
    .filter((candidate) => normalize(candidate.text) !== openingKey && normalize(candidate.text) !== normalize(flavor) && candidate.serving >= 2)
    .sort((a, b) => b.serving - a.serving || a.index - b.index)[0]?.text || '';

  const parts: string[] = [];
  if (opening) parts.push(shortenToWords(opening, 112));
  if (flavor) parts.push(shortenToWords(flavor, 145));
  if (serving) parts.push(shortenToWords(serving, 105));

  if (!parts.length) return '';

  // Keep the finished note compact enough for the one-sheet while allowing the sales-friendly opener + flavor + serving pattern.
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
  return shortenToWords(joined, 240);
}

function salesHighlightLabel(value: string) {
  const cleaned = cleanCommerce7Copy(value);
  const match = cleaned.match(/^([^:]{2,42}):\s*(.+)$/);
  if (!match) return { label: '', body: cleaned };
  let label = match[1].trim();
  if (/^incredible versatility$/i.test(label)) label = 'Versatility';
  if (/^the ultimate fall gift$/i.test(label)) label = 'Giftability';
  return { label, body: simplifySalesSentence(match[2]) };
}

function highlightScore(value: string) {
  const lower = value.toLowerCase();
  let score = 0;
  if (/award|gold|silver|bronze|best of class|double gold/.test(lower)) score += 8;
  if (/versatil|serve|enjoy|chilled|room temperature|warm|crockpot|over ice/.test(lower)) score += 7;
  if (/estate|limited|small lot|cases produced|single vineyard|unique|first/.test(lower)) score += 5;
  if (/pair|food|pizza|dessert|cheese|grill/.test(lower)) score += 3;
  if (/gift|party|occasion|gathering|stock up/.test(lower)) score -= 2;
  return score;
}

function commerce7SalesHighlights(wine?: WineRecord) {
  if (!wine) return [];
  const raw = (wine.highlights || [])
    .map(cleanCommerce7Copy)
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((candidate) => normalize(candidate) === normalize(item)) === index);

  if (!raw.length) return [];

  const ranked = raw
    .map((item, index) => ({ item, index, score: highlightScore(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = ranked.slice(0, Math.min(2, ranked.length)).sort((a, b) => a.index - b.index);
  return selected.map(({ item }) => {
    const { label, body } = salesHighlightLabel(item);
    return label ? `${label}: ${shortenToWords(body, 145)}` : shortenToWords(body, 145);
  });
}

function HighlightCopy({ item }: { item: string }) {
  const match = item.match(/^([^:]{2,42}):\s*(.+)$/);
  if (!match) return <FormattedCopy text={item} />;
  return <><strong><FormattedCopy text={match[1]} />:</strong> <FormattedCopy text={match[2]} /></>;
}

function wineImageAssets(wine: WineRecord) {
  if (wine.imageAssets?.length) return [...wine.imageAssets].sort((a, b) => a.sortOrder - b.sortOrder);
  return wine.bottleImage ? [{ id: `${wine.id}-front`, src: wine.bottleImage, sortOrder: 0, role: 'front' as const }] : [];
}

function assetFileBase(wine: WineRecord, role: string, index: number) {
  const vintage = wine.vintage && wine.vintage !== 'NV' ? `-${wine.vintage}` : '';
  const suffix = role === 'front' ? 'Front' : role === 'back' ? 'Back' : `Image-${index + 1}`;
  return `${wine.name}${vintage}-${suffix}`.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function downloadImageAsFormat(src: string, format: 'png' | 'jpeg', filenameBase: string) {
  try {
    const response = await fetch(colorSampleImageUrl(src));
    if (!response.ok) throw new Error(`Image request failed (${response.status})`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable.');
        if (format === 'jpeg') {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(image, 0, 0);
        canvas.toBlob((output) => {
          if (!output) return;
          const downloadUrl = URL.createObjectURL(output);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${filenameBase}.${format === 'jpeg' ? 'jpg' : 'png'}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        }, format === 'jpeg' ? 'image/jpeg' : 'image/png', .94);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => URL.revokeObjectURL(objectUrl);
    image.src = objectUrl;
  } catch (error) {
    console.error('Unable to download asset', error);
    window.alert('Wine Hub could not prepare that image for download.');
  }
}


function downloadTextFile(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function assetName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}


function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (!delta) return { saturation: 0, lightness };
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  return { saturation, lightness };
}

function colorSampleImageUrl(imageUrl: string) {
  if (/^(data:|blob:|\/)/i.test(imageUrl)) return imageUrl;
  if (/^https?:\/\//i.test(imageUrl)) return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  return imageUrl;
}

async function prominentLabelColor(imageUrl?: string): Promise<string | null> {
  if (!imageUrl || typeof document === 'undefined') return null;
  return await new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const width = 120;
        const height = 180;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return resolve(null);
        context.clearRect(0, 0, width, height);
        const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const dx = (width - drawWidth) / 2;
        const dy = (height - drawHeight) / 2;
        context.drawImage(image, dx, dy, drawWidth, drawHeight);
        const pixels = context.getImageData(0, 0, width, height).data;

        let minX = width, minY = height, maxX = 0, maxY = 0;
        for (let y = 0; y < height; y += 2) {
          for (let x = 0; x < width; x += 2) {
            const i = (y * width + x) * 4;
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
            const nearlyWhite = r > 245 && g > 245 && b > 245;
            if (a > 35 && !nearlyWhite) {
              minX = Math.min(minX, x); maxX = Math.max(maxX, x);
              minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            }
          }
        }
        if (minX > maxX || minY > maxY) return resolve(null);

        const boxWidth = maxX - minX + 1;
        const boxHeight = maxY - minY + 1;
        const cropMinX = Math.max(0, Math.floor(minX + boxWidth * 0.14));
        const cropMaxX = Math.min(width - 1, Math.ceil(maxX - boxWidth * 0.14));
        const cropMinY = Math.max(0, Math.floor(minY + boxHeight * 0.43));
        const cropMaxY = Math.min(height - 1, Math.ceil(minY + boxHeight * 0.9));

        type Bucket = { count: number; r: number; g: number; b: number; score: number };
        const buckets = new Map<string, Bucket>();
        for (let y = cropMinY; y <= cropMaxY; y += 2) {
          for (let x = cropMinX; x <= cropMaxX; x += 2) {
            const i = (y * width + x) * 4;
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
            if (a < 60) continue;
            const { saturation, lightness } = rgbToHsl(r, g, b);
            if (lightness > 0.9 || lightness < 0.11 || saturation < 0.22) continue;
            const qr = Math.round(r / 24) * 24;
            const qg = Math.round(g / 24) * 24;
            const qb = Math.round(b / 24) * 24;
            const key = `${qr}-${qg}-${qb}`;
            const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0, score: 0 };
            bucket.count += 1;
            bucket.r += r; bucket.g += g; bucket.b += b;
            bucket.score += 0.6 + saturation * 1.4;
            buckets.set(key, bucket);
          }
        }
        const winner = [...buckets.values()].sort((a, b) => b.score - a.score || b.count - a.count)[0];
        if (!winner) return resolve(null);
        resolve(rgbToHex(winner.r / winner.count, winner.g / winner.count, winner.b / winner.count));
      } catch (error) {
        console.warn('Unable to sample bottle image color', error);
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = colorSampleImageUrl(imageUrl);
  });
}

const GUIDE_CATEGORY_ORDER = ['Red', 'White', 'Rosé', 'Sparkling', 'Fruit & Sweet', 'Dessert', 'Seasonal / Specialty', 'Other'];

function guideCategoryFor(wine: WineRecord) {
  const text = `${wine.category} ${wine.varietal || ''} ${wine.name}`.toLowerCase();
  if (/sparkling|bubbly|brüt|brut|cuvée|cuvee|cold duck|cherries galore/.test(text)) return 'Sparkling';
  if (/rosé|rose/.test(text)) return 'Rosé';
  if (/dessert|port|cordial/.test(text)) return 'Dessert';
  if (/red|baco|merlot|meritage|pinot noir|cabernet|nouveau/.test(text)) return 'Red';
  if (/white|riesling|pinot grigio|gewürz|gewurz|chardonnay|sauvignon blanc|vignoles|renaissance/.test(text)) return 'White';
  if (/fruit|cherry|blueberry|blackberry|apple|cranberry|sangria/.test(text)) return 'Fruit & Sweet';
  if (/seasonal|witches|winter white|summer sunset|spring splendor|autumn harvest/.test(text)) return 'Seasonal / Specialty';
  return 'Other';
}

function printWithTitle(title: string) {
  const previousTitle = document.title;
  const cleanTitle = title.replace(/[<>:"/\\|?*]+/g, '-').replace(/\s+/g, ' ').trim();
  document.title = cleanTitle;
  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  window.print();
}

function mergeCommerce7(current: WineRecord[], incoming: WineRecord[]) {
  const used = new Set<string>();
  const merged = incoming.map((remote) => {
    const local = current.find((candidate) =>
      (candidate.commerce7Id && candidate.commerce7Id === remote.commerce7Id) ||
      (normalize(candidate.name) === normalize(remote.name) && candidate.vintage === remote.vintage),
    );
    if (!local) return remote;
    used.add(local.id);
    return {
      ...remote,
      id: local.id,
      tastingNotes: remote.tastingNotes || local.tastingNotes,
      shortDescription: remote.shortDescription || local.shortDescription,
      staffPitch: remote.staffPitch || local.staffPitch,
      pairings: remote.pairings || local.pairings,
      highlights: remote.highlights.length ? remote.highlights : local.highlights,
      productionNotes: remote.productionNotes || local.productionNotes,
      vineyardNotes: remote.vineyardNotes || local.vineyardNotes,
      awards: remote.awards.length ? remote.awards : local.awards,
      sweetness: remote.sweetness || local.sweetness,
      casePack: remote.casePack || local.casePack,
      casesProduced: remote.casesProduced || local.casesProduced,
      abv: remote.abv || local.abv,
      rs: remote.rs || local.rs,
      ta: remote.ta || local.ta,
      ph: remote.ph || local.ph,
      source: 'commerce7' as const,
    };
  });
  const hubOnly = current.filter((wine) => !used.has(wine.id) && wine.source !== 'commerce7');
  return [...merged, ...hubOnly].sort((a, b) => a.name.localeCompare(b.name));
}

function estimatedRichLines(value: string, charsPerLine: number) {
  const plain = plainFormattedText(value);
  if (!plain) return 0;
  return plain
    .split(/\n+/)
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.trim().length / charsPerLine)), 0);
}

function shouldAutoIncludeCasePackaging(wine: WineRecord, tastingNotes: string, highlights: string[]) {
  if (!casePackagingForWine(wine)) return false;

  // Keep the original full-size tech-sheet typography. Instead of shrinking a crowded
  // page, skip the optional case artwork when the default copy would likely push it
  // past the footer. Sales can still turn Case Packaging back on manually.
  const notesLines = estimatedRichLines(tastingNotes, 50);
  const highlightLines = highlights.reduce((sum, item) => sum + estimatedRichLines(item, 44), 0);
  const projectedContentHeight =
    72 + // top/bottom breathing room in the content column
    38 + notesLines * 25 + // Tasting Notes heading + copy
    148 + // Wine Specs with the standard four populated rows
    38 + highlightLines * 23 + // Highlights heading + bullets
    225; // Case Packaging heading + image + section spacing

  return projectedContentHeight <= 790;
}

function draftFromWine(wine: WineRecord): TechSheetDraft {
  const casePackaging = casePackagingForWine(wine);
  const tastingNotes = shortCommerce7TastingNotes(wine) || wine.tastingNotes || wine.shortDescription || '';
  const highlights = commerce7SalesHighlights(wine);
  return {
    wineId: wine.id,
    wineName: wine.name,
    tastingNotes,
    highlights,
    abv: wine.abv || '',
    casePack: wine.casePack || (wine.volumeMl ? `12–${wine.volumeMl} mL bottles` : ''),
    upc: formatUpc(wine.upc || ''),
    retailerCost: '',
    distributorCost: '',
    srp: wine.price === undefined ? '' : `$${wine.price.toFixed(2)}`,
    bottleImage: wine.bottleImage,
    awardGraphic: wine.awards[0]?.graphicUrl,
    includeCasePackaging: Boolean(casePackaging) && shouldAutoIncludeCasePackaging(wine, tastingNotes, highlights),
    casePackagingImage: casePackaging?.src,
    displayImage: undefined,
    bottleScale: 2.55,
    bottleOffsetY: 0,
    headerColor: TECH_COLOR,
    autoHeaderColor: true,
    footer: FOOTER,
  };
}

export default function WineHub() {
  const [view, setView] = useState<View>('library');
  const [wines, setWines] = useState<WineRecord[]>(SEED_WINES);
  const [activeWineId, setActiveWineId] = useState(SEED_WINES[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');
  const [editingWine, setEditingWine] = useState<WineRecord | null>(null);
  const [techDraft, setTechDraft] = useState<TechSheetDraft>(() => draftFromWine(SEED_WINES[0]));
  const [tastingIds, setTastingIds] = useState<string[]>([]);
  const [needsCurrentMenuSeed, setNeedsCurrentMenuSeed] = useState(false);
  const [access, setAccess] = useState<{ loading: boolean; enabled: boolean; configured: boolean; role: AccessRole | null }>({ loading: true, enabled: false, configured: false, role: null });
  const [sync, setSync] = useState<SyncState>({ configured: false, loading: false, message: 'Checking Commerce7…' });
  const [mobileNav, setMobileNav] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savingMaster, setSavingMaster] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [savingMenu, setSavingMenu] = useState(false);

  const activeWine = wines.find((wine) => wine.id === activeWineId) ?? wines[0];
  const canUseTechSheets = access.role === 'admin' || access.role === 'sales';
  const canUseTastingRoom = access.role === 'admin' || access.role === 'tasting';

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setWines(JSON.parse(saved));
      const menu = window.localStorage.getItem(MENU_KEY);
      const menuVersion = window.localStorage.getItem(MENU_VERSION_KEY);
      if (menu && menuVersion === CURRENT_TASTING_MENU_VERSION) {
        setTastingIds(JSON.parse(menu));
      } else {
        setNeedsCurrentMenuSeed(true);
      }
    } catch (error) {
      console.warn('Unable to restore Wine Hub data', error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
  }, [wines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(MENU_KEY, JSON.stringify(tastingIds));
  }, [tastingIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const validIds = new Set(wines.map((wine) => wine.id));
    setTastingIds((current) => {
      const cleaned = current.filter((id) => validIds.has(id));
      return cleaned.length === current.length ? current : cleaned;
    });
  }, [wines, hydrated]);

  useEffect(() => {
    if (!hydrated || !needsCurrentMenuSeed || !wines.length) return;
    const matches = matchMenuText(CURRENT_TASTING_MENU_TEXT, wines);
    if (!matches.length) return;
    setTastingIds(matches.map((wine) => wine.id));
    window.localStorage.setItem(MENU_VERSION_KEY, CURRENT_TASTING_MENU_VERSION);
    setNeedsCurrentMenuSeed(false);
  }, [wines, hydrated, needsCurrentMenuSeed]);

  useEffect(() => {
    void loadAccessSession();
  }, []);

  useEffect(() => {
    if (access.role) void checkCommerce7();
  }, [access.role]);

  useEffect(() => {
    if (!activeWine) return;
    setTechDraft(draftFromWine(activeWine));
  }, [activeWineId]);

  useEffect(() => {
    if (!wines.length) return;
    const params = new URLSearchParams(window.location.search);
    const commerce7Id = params.get('productId') || params.get('productID') || params.get('product');
    if (!commerce7Id) return;
    const match = wines.find((wine) => wine.commerce7Id === commerce7Id || wine.id === commerce7Id);
    if (match) {
      setActiveWineId(match.id);
      setView('profile');
    }
  }, [wines]);

  async function loadAccessSession() {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json() as { enabled?: boolean; configured?: boolean; role?: AccessRole | null };
      setAccess({ loading: false, enabled: Boolean(data.enabled), configured: Boolean(data.configured), role: data.role || 'admin' });
    } catch {
      setAccess({ loading: false, enabled: false, configured: false, role: 'admin' });
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setAccess((current) => ({ ...current, role: current.enabled ? null : 'admin' }));
    setView('library');
    setMobileNav(false);
  }

  async function checkCommerce7() {
    try {
      const response = await fetch('/api/commerce7/status', { cache: 'no-store' });
      const data = await response.json();
      if (data.configured) {
        setSync({ configured: true, loading: false, message: `Commerce7 connected · ${data.tenant}` });
        await syncCommerce7(true);
      } else {
        setSync({ configured: false, loading: false, message: 'Demo catalog · Commerce7 not connected yet' });
      }
    } catch {
      setSync({ configured: false, loading: false, message: 'Demo catalog · Commerce7 not connected yet' });
    }
  }

  async function syncCommerce7(silent = false) {
    if (!silent) setSync((state) => ({ ...state, loading: true, message: 'Syncing Commerce7…' }));
    try {
      const response = await fetch('/api/commerce7/products', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sync');
      const remoteWines = data.wines as WineRecord[];
      const nextWines = mergeCommerce7(wines, remoteWines);
      setWines(nextWines);
      const currentMenuMatches = matchMenuText(CURRENT_TASTING_MENU_TEXT, nextWines);
      if (currentMenuMatches.length) {
        setTastingIds(currentMenuMatches.map((wine) => wine.id));
        window.localStorage.setItem(MENU_VERSION_KEY, CURRENT_TASTING_MENU_VERSION);
      }
      setSync({ configured: true, loading: false, message: `${data.total} wines synced from Commerce7`, lastSynced: new Date().toISOString() });
    } catch (error) {
      setSync((state) => ({ ...state, loading: false, message: error instanceof Error ? error.message : 'Commerce7 sync failed' }));
    }
  }

  function openWine(wine: WineRecord) {
    setActiveWineId(wine.id);
    setProfileTab('overview');
    setEditingWine(null);
    setView('profile');
    setMobileNav(false);
  }

  function openTech(wine = activeWine) {
    if (!wine || !canUseTechSheets) return;
    setActiveWineId(wine.id);
    setTechDraft(draftFromWine(wine));
    setView('tech');
    setMobileNav(false);
  }

  async function saveMasterWine() {
    if (!editingWine || savingMaster) return;
    setSavingMaster(true);
    setSaveNotice('');
    const saved = { ...editingWine, source: editingWine.source === 'demo' ? 'hub' as const : editingWine.source, updatedAt: new Date().toISOString() };
    try {
      if (saved.source === 'commerce7' && saved.commerce7Id && sync.configured) {
        const response = await fetch(`/api/commerce7/products/${encodeURIComponent(saved.commerce7Id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to save to Commerce7');
      }
      setWines((current) => current.map((wine) => wine.id === saved.id ? saved : wine));
      setEditingWine(null);
      setSaveNotice(saved.source === 'commerce7' ? 'Saved to Commerce7.' : 'Saved in this Wine Hub.');
      window.setTimeout(() => setSaveNotice(''), 2400);
    } catch (error) {
      setSaveNotice(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSavingMaster(false);
    }
  }

  async function saveTastingMenu() {
    if (savingMenu) return;
    setSavingMenu(true);
    try {
      const changes = wines
        .filter((wine) => wine.source === 'commerce7' && wine.commerce7Id)
        .map((wine) => ({ wine, next: tastingIds.includes(wine.id) }))
        .filter(({ wine, next }) => wine.onTastingMenu !== next);

      if (sync.configured && changes.length) {
        const response = await fetch('/api/commerce7/tasting-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes: changes.map(({ wine, next }) => ({ commerce7Id: wine.commerce7Id, onTastingMenu: next })) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to save tasting menu');
      }

      setWines((current) => current.map((wine) => ({ ...wine, onTastingMenu: tastingIds.includes(wine.id) })));
      window.localStorage.setItem(MENU_VERSION_KEY, CURRENT_TASTING_MENU_VERSION);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to save tasting menu');
    } finally {
      setSavingMenu(false);
    }
  }

  function addAwardToEditing() {
    if (!editingWine) return;
    const award: Award = {
      id: `award-${Date.now()}`,
      year: new Date().getFullYear(),
      competition: 'San Francisco Chronicle Wine Competition',
      result: 'Gold',
    };
    setEditingWine({ ...editingWine, awards: [...editingWine.awards, award] });
  }

  const categories = useMemo(() => ['All', ...Array.from(new Set(wines.map((wine) => wine.category))).sort()], [wines]);
  const filteredWines = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wines.filter((wine) => {
      const categoryMatch = category === 'All' || wine.category === category;
      const searchMatch = !q || `${wine.name} ${wine.vintage} ${wine.varietal ?? ''} ${wine.category} ${wine.brand}`.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [wines, query, category]);

  if (access.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]"><div className="text-center"><img src="/lwc-logo.png" alt="Leelanau Cellars" className="mx-auto h-16 w-16 border border-black bg-white object-cover" /><Loader2 className="mx-auto mt-5 h-6 w-6 animate-spin text-black/40" /><p className="mt-3 text-sm font-bold text-black/45">Opening Wine Hub…</p></div></div>;
  }

  if (access.enabled && !access.role) {
    return <PinGate configured={access.configured} onAccess={(role) => { setAccess({ loading: false, enabled: true, configured: true, role }); setView('library'); }} />;
  }

  return (
    <div className="app-shell min-h-screen bg-[#f5f6f8] text-[#171717]">
      <aside className={`no-print fixed inset-y-0 left-0 z-40 w-[248px] border-r border-black/10 bg-white transition-transform lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col p-4">
          <div className="mb-7 flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <img src="/lwc-logo.png" alt="Leelanau Cellars" className="h-12 w-12 border border-black object-cover" />
              <div><p className="text-[11px] font-black uppercase tracking-[.22em]">Leelanau</p><p className="text-sm font-semibold">Wine Hub</p></div>
            </div>
            <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
          </div>

          <nav className="space-y-1">
            <NavButton active={view === 'library' || view === 'profile'} icon={<Library />} label="Wine Library" onClick={() => { setView('library'); setMobileNav(false); }} />
            {canUseTastingRoom && <NavButton active={view === 'tasting'} icon={<ClipboardList />} label="Staff Notes" onClick={() => { setView('tasting'); setMobileNav(false); }} />}
            {canUseTastingRoom && <NavButton active={view === 'quickfacts'} icon={<BookOpen />} label="Quick Facts" onClick={() => { setView('quickfacts'); setMobileNav(false); }} />}
            {canUseTechSheets && <NavButton active={view === 'tech'} icon={<FileText />} label="Tech Sheets" onClick={() => { setView('tech'); setMobileNav(false); }} />}
            <NavButton active={view === 'awards'} icon={<AwardIcon />} label="Awards" onClick={() => { setView('awards'); setMobileNav(false); }} />
            <NavButton active={view === 'assets'} icon={<ImageIcon />} label="Assets" onClick={() => { setView('assets'); setMobileNav(false); }} />
          </nav>

          <div className="mt-auto space-y-3">
            {access.enabled && <div className="rounded-2xl border border-black/10 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-black/35">Access</p><p className="mt-1 text-xs font-black">{access.role === 'admin' ? 'Admin' : access.role === 'sales' ? 'Sales' : 'Tasting Room'}</p></div>
                <button onClick={() => void logout()} className="flex items-center gap-1.5 rounded-lg border border-black/10 px-2.5 py-2 text-[10px] font-black text-black/55 hover:bg-black/[.04]"><LogOut className="h-3.5 w-3.5" /> Log out</button>
              </div>
            </div>}
            <div className="rounded-2xl border border-black/10 bg-[#f8f9fb] p-3">
            <div className="flex items-start gap-2.5">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${sync.configured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <div className="min-w-0"><p className="text-xs font-bold">Data source</p><p className="mt-1 text-[11px] leading-4 text-black/55">{sync.message}</p></div>
            </div>
            <button onClick={() => void syncCommerce7()} disabled={!sync.configured || sync.loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45">
              {sync.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Sync now
            </button>
            </div>
          </div>
        </div>
      </aside>

      {mobileNav && <button className="no-print fixed inset-0 z-30 bg-black/25 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close menu overlay" />}

      <main className="min-h-screen lg:pl-[248px]">
        <div className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/10 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setMobileNav(true)} className="rounded-lg border border-black/10 p-2"><Menu className="h-5 w-5" /></button>
          <span className="font-bold">Leelanau Wine Hub</span>
        </div>

        {view === 'library' && (
          <WineLibrary wines={filteredWines} allWines={wines} categories={categories} query={query} setQuery={setQuery} category={category} setCategory={setCategory} openWine={openWine} openTech={openTech} sync={sync} allowTechSheets={canUseTechSheets} />
        )}
        {view === 'profile' && activeWine && (
          <WineProfile wine={activeWine} tab={profileTab} setTab={setProfileTab} editing={editingWine} setEditing={setEditingWine} save={saveMasterWine} saving={savingMaster} saveNotice={saveNotice} addAward={addAwardToEditing} back={() => setView('library')} openTech={() => openTech(activeWine)} allowTechSheets={canUseTechSheets} />
        )}
        {view === 'tasting' && canUseTastingRoom && (
          <TastingRoom wines={wines} selected={tastingIds} setSelected={setTastingIds} openWine={openWine} saveMenu={saveTastingMenu} savingMenu={savingMenu} commerce7Connected={sync.configured} role={access.role as AccessRole} />
        )}
        {view === 'quickfacts' && canUseTastingRoom && <QuickFactsView />}
        {view === 'tech' && canUseTechSheets && (
          <TechSheetBuilder wines={wines} activeWine={activeWine} activeWineId={activeWineId} setActiveWineId={setActiveWineId} draft={techDraft} setDraft={setTechDraft} />
        )}
        {view === 'awards' && <AwardsView wines={wines} openWine={openWine} />}
        {view === 'assets' && <AssetsView wines={wines} openWine={openWine} />}
      </main>
    </div>
  );
}


function PinGate({ configured, onAccess }: { configured: boolean; onAccess: (role: AccessRole) => void }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!pin.trim() || loading || !configured) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await response.json() as { role?: AccessRole; error?: string };
      if (!response.ok || !data.role) throw new Error(data.error || 'Unable to sign in.');
      onAccess(data.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="flex min-h-screen items-center justify-center bg-[#f3f5f7] px-5 py-12">
    <div className="w-full max-w-[430px] rounded-[28px] border border-black/10 bg-white p-7 shadow-2xl shadow-black/10 sm:p-9">
      <div className="flex items-center gap-4">
        <img src="/lwc-logo.png" alt="Leelanau Cellars" className="h-16 w-16 border border-black bg-white object-cover" />
        <div><p className="text-[10px] font-black uppercase tracking-[.24em] text-black/40">Internal access</p><h1 className="mt-1 text-2xl font-black tracking-[-.035em]">Leelanau Cellars Wine Hub</h1></div>
      </div>
      <p className="mt-6 text-sm leading-6 text-black/55">Enter your team PIN. Your access determines whether you see Sales tools, Tasting Room tools, or the full Admin hub.</p>
      {!configured ? <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <p className="font-black">PIN access needs to be configured in Vercel.</p>
        <p className="mt-1">Add <code>WINE_HUB_AUTH_SECRET</code>, <code>WINE_HUB_ADMIN_PIN</code>, <code>WINE_HUB_SALES_PIN</code>, and <code>WINE_HUB_TASTING_PIN</code> as Environment Variables, then redeploy.</p>
      </div> : <form onSubmit={submit} className="mt-6">
        <label className="block"><span className="field-label">Team PIN</span><input type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} autoFocus placeholder="Enter PIN" className="field-input mt-1 text-lg tracking-[.18em]" /></label>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
        <button type="submit" disabled={!pin.trim() || loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} {loading ? 'Opening Wine Hub…' : 'Access Wine Hub'}</button>
      </form>}
      <p className="mt-5 text-center text-[10px] leading-4 text-black/35">Access remains remembered on this device for 30 days unless you log out.</p>
    </div>
  </div>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-black text-white' : 'text-black/65 hover:bg-black/[.045] hover:text-black'}`}><span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>{label}</button>;
}

function PageHeader({ eyebrow, title, description, right }: { eyebrow: string; title: string; description?: string; right?: React.ReactNode }) {
  return <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-[#3976b7]">{eyebrow}</p><h1 className="text-3xl font-black tracking-[-.035em] md:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{description}</p>}</div>{right}</header>;
}

function WineLibrary({ wines, allWines, categories, query, setQuery, category, setCategory, openWine, openTech, sync, allowTechSheets }: {
  wines: WineRecord[]; allWines: WineRecord[]; categories: string[]; query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; openWine: (wine: WineRecord) => void; openTech: (wine: WineRecord) => void; sync: SyncState; allowTechSheets: boolean;
}) {
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [batchColors, setBatchColors] = useState<Record<string, string>>({});
  const [preparingBatch, setPreparingBatch] = useState(false);
  const selectedWines = allWines.filter((wine) => selectedTechIds.includes(wine.id));

  const toggleSelected = (id: string) => setSelectedTechIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const printBatch = async () => {
    if (!selectedWines.length || preparingBatch) return;
    setPreparingBatch(true);
    const entries = await Promise.all(selectedWines.map(async (wine) => {
      const color = wine.bottleImage ? await prominentLabelColor(wine.bottleImage) : undefined;
      return [wine.id, color || TECH_COLOR] as const;
    }));
    setBatchColors(Object.fromEntries(entries));
    setPreparingBatch(false);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => printWithTitle(`Leelanau Cellars - ${selectedWines.length} Tech Sheets`)));
  };

  return <>
    <div className="no-print mx-auto max-w-[1480px] p-5 md:p-8 xl:p-10">
      <PageHeader eyebrow="Wine Hub" title="Wine Library" description="Search a wine once and find the product facts, sales language, awards, assets and printable documents your team needs." right={<div className="flex flex-wrap items-center justify-end gap-2">{allowTechSheets && <button onClick={() => setBatchMode((current) => !current)} className={`rounded-xl border px-4 py-2.5 text-xs font-black shadow-sm ${batchMode ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/65'}`}>{batchMode ? 'Done selecting' : 'Select tech sheets'}</button>}<Stat value={allWines.length} label="wines" /></div>} />

      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search wine, vintage, varietal or style…" className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none focus:border-black/30" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-4 py-3 text-xs font-bold ${category === item ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/60 hover:border-black/25'}`}>{item}</button>)}</div>
      </div>

      {batchMode && <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#b9d7f3] bg-[#eef6fd] p-4 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm font-black">Batch tech sheets</p><p className="mt-1 text-xs leading-5 text-black/50">Select wines below, then save them as one multi-page PDF. Notes, highlights, specs and awards are filled automatically; case packaging is included when the default copy leaves enough room.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm">{selectedWines.length} selected</span>
          <button onClick={() => setSelectedTechIds(Array.from(new Set([...selectedTechIds, ...wines.map((wine) => wine.id)])))} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold">Select visible</button>
          <button onClick={() => setSelectedTechIds([])} disabled={!selectedWines.length} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">Clear</button>
          <button onClick={() => void printBatch()} disabled={!selectedWines.length || preparingBatch} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-black text-white disabled:opacity-40">{preparingBatch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{preparingBatch ? 'Preparing…' : `Print / Save ${selectedWines.length || ''} sheets`}</button>
        </div>
      </div>}

      {!sync.configured && <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm"><Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><strong>Demo catalog is active.</strong> Connect the Commerce7 environment variables and the library will populate from your live Product catalog automatically. Any Wine Hub copy you edit is preserved when product facts sync.</div></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {wines.map((wine) => <WineCard key={wine.id} wine={wine} open={() => openWine(wine)} tech={() => openTech(wine)} batchMode={allowTechSheets && batchMode} selected={selectedTechIds.includes(wine.id)} toggleSelected={() => toggleSelected(wine.id)} allowTechSheet={allowTechSheets} />)}
      </div>
      {!wines.length && <div className="rounded-2xl border border-dashed border-black/20 bg-white py-24 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-black/20" /><p className="font-bold">No wines match that search.</p></div>}
    </div>

    {allowTechSheets && batchMode && selectedWines.length > 0 && <div className="batch-tech-print print-root hidden print:block">
      {selectedWines.map((wine) => {
        const batchDraft = { ...draftFromWine(wine), headerColor: batchColors[wine.id] || TECH_COLOR };
        return <div key={`batch-${wine.id}`} className="batch-tech-page"><TechSheetPaper draft={batchDraft} wine={wine} /></div>;
      })}
    </div>}
  </>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="min-w-20 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-center shadow-sm"><strong className="block text-lg leading-5">{value}</strong><span className="text-[10px] font-bold uppercase tracking-[.14em] text-black/40">{label}</span></div>;
}

function WineCard({ wine, open, tech, batchMode = false, selected = false, toggleSelected, allowTechSheet = true }: { wine: WineRecord; open: () => void; tech: () => void; batchMode?: boolean; selected?: boolean; toggleSelected?: () => void; allowTechSheet?: boolean }) {
  const award = wine.awards[0];
  return <article className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${selected ? 'border-[#3976b7] ring-2 ring-[#3976b7]/15' : 'border-black/10'}`}>
    <button onClick={() => batchMode ? toggleSelected?.() : open()} className="block w-full text-left" aria-label={batchMode ? `${selected ? 'Deselect' : 'Select'} ${wine.name} for batch tech sheets` : `Open ${wine.name}`}>
      <div className="relative h-56 overflow-hidden bg-[#eef2f6]">
        {wine.bottleImage ? <img src={wine.bottleImage} alt="" className="h-full w-full object-contain object-center p-3 transition duration-300 group-hover:scale-[1.02]" /> : <WinePlaceholder wine={wine} />}
        <div className="absolute left-3 top-3 flex gap-2"><span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] shadow-sm">{wine.category}</span>{wine.source === 'commerce7' && <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-white">C7</span>}</div>
        {award && <span className="absolute bottom-3 left-3 rounded-full bg-[#d7a33d] px-2.5 py-1 text-[10px] font-black uppercase text-white">{award.result} · {award.year}</span>}
      </div>
      <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black leading-5">{wine.name}</h2><p className="mt-1 text-xs font-semibold text-black/45">{wine.vintage} · {wine.varietal || wine.category}</p></div><span className="text-sm font-black">{money(wine.price)}</span></div><p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-black/55">{wine.shortDescription || wine.tastingNotes || 'Add a quick description for your staff.'}</p></div>
    </button>
    <div className="flex flex-wrap border-t border-black/8 p-2">
      {batchMode && <label className={`mr-1 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${selected ? 'bg-[#eaf3fb] text-[#326eac]' : 'hover:bg-black/[.04]'}`}><input type="checkbox" checked={selected} onChange={() => toggleSelected?.()} className="h-3.5 w-3.5 accent-[#326eac]" /> PDF</label>}
      <button onClick={open} className="min-w-[92px] flex-1 rounded-lg px-3 py-2 text-xs font-bold hover:bg-black/[.04]">View profile</button>{allowTechSheet && <button onClick={tech} className="min-w-[82px] flex-1 rounded-lg px-3 py-2 text-xs font-bold text-[#326eac] hover:bg-[#eaf3fb]">Tech sheet</button>}
    </div>
  </article>;
}

function WinePlaceholder({ wine }: { wine: WineRecord }) {
  const letters = wine.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return <div className="flex h-full items-center justify-center"><div className="flex h-24 w-16 items-center justify-center rounded-t-2xl rounded-b-lg border-2 border-black/15 bg-white text-xl font-black text-black/35 shadow-xl"><span>{letters}</span></div></div>;
}

function WineProfile({ wine, tab, setTab, editing, setEditing, save, saving, saveNotice, addAward, back, openTech, allowTechSheets }: {
  wine: WineRecord; tab: ProfileTab; setTab: (tab: ProfileTab) => void; editing: WineRecord | null; setEditing: (wine: WineRecord | null) => void; save: () => void | Promise<void>; saving: boolean; saveNotice: string; addAward: () => void; back: () => void; openTech: () => void; allowTechSheets: boolean;
}) {
  const shown = editing ?? wine;
  const isEditing = Boolean(editing);
  const update = <K extends keyof WineRecord>(key: K, value: WineRecord[K]) => editing && setEditing({ ...editing, [key]: value });
  const updateAward = (index: number, patch: Partial<Award>) => editing && setEditing({ ...editing, awards: editing.awards.map((award, awardIndex) => awardIndex === index ? { ...award, ...patch } : award) });
  const removeAward = (index: number) => editing && setEditing({ ...editing, awards: editing.awards.filter((_, awardIndex) => awardIndex !== index) });
  return <div className="no-print mx-auto max-w-[1320px] p-5 md:p-8 xl:p-10">
    <button onClick={back} className="mb-5 flex items-center gap-1.5 text-xs font-bold text-black/50 hover:text-black"><ChevronLeft className="h-4 w-4" /> Wine Library</button>
    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-5">
        <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white">{shown.bottleImage ? <img src={shown.bottleImage} alt="" className="h-full w-full object-contain p-2" /> : <WinePlaceholder wine={shown} />}</div>
        <div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e8f2fb] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#326eac]">{shown.category}</span><span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-black/45">{shown.status}</span>{shown.source === 'commerce7' && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-emerald-700">Synced from Commerce7</span>}</div><h1 className="text-4xl font-black tracking-[-.04em]">{shown.name}</h1><p className="mt-2 text-sm font-semibold text-black/45">{shown.vintage} · {shown.varietal || 'Varietal not set'} · {shown.appellation || 'Appellation not set'}</p></div>
      </div>
      <div className="flex flex-col items-start gap-2 lg:items-end">{allowTechSheets && <button onClick={openTech} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white"><FileText className="h-4 w-4" /> Build tech sheet</button>}<p className="max-w-sm text-right text-[11px] leading-4 text-black/40">Product and master wine information is managed in Commerce7.</p></div>
    </div>

    <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-black/10 bg-white p-1.5">{(['overview','sales','specs','assets'] as ProfileTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-4 py-2 text-xs font-black capitalize ${tab === item ? 'bg-black text-white' : 'text-black/45 hover:bg-black/[.04]'}`}>{item}</button>)}</div>

    {tab === 'overview' && <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <div className="space-y-5">
        <ProfileBlock title="Quick description" badge="Staff-ready">{isEditing ? <Textarea value={shown.shortDescription} onChange={(value) => update('shortDescription', value)} rows={3} /> : <p className="profile-copy">{shown.shortDescription || 'Add a short description.'}</p>}</ProfileBlock>
        <ProfileBlock title="Tasting notes">{isEditing ? <Textarea value={shown.tastingNotes} onChange={(value) => update('tastingNotes', value)} rows={5} /> : <p className="profile-copy">{shown.tastingNotes || 'Add tasting notes.'}</p>}</ProfileBlock>
        <ProfileBlock title="What to tell a customer" badge="Sales team">{isEditing ? <Textarea value={shown.staffPitch} onChange={(value) => update('staffPitch', value)} rows={4} /> : <p className="profile-copy">{shown.staffPitch || 'Add a simple customer-facing pitch.'}</p>}</ProfileBlock>
        <ProfileBlock title="Pairings">{isEditing ? <Textarea value={shown.pairings} onChange={(value) => update('pairings', value)} rows={3} /> : <p className="profile-copy">{shown.pairings || 'Add pairing ideas.'}</p>}</ProfileBlock>
      </div>
      <div className="space-y-5">
        <ProfileBlock title="At a glance"><dl className="grid grid-cols-2 gap-x-4 gap-y-4"><QuickFact label="Style" value={shown.category} /><QuickFact label="Sweetness" value={shown.sweetness || '—'} /><QuickFact label="ABV" value={shown.abv || '—'} /><QuickFact label="SRP" value={money(shown.price)} /><QuickFact label="Volume" value={shown.volumeMl ? `${shown.volumeMl} mL` : '—'} /><QuickFact label="UPC" value={shown.upc ? formatUpc(shown.upc) : '—'} /></dl></ProfileBlock>
        <ProfileBlock title="Awards" badge={`${shown.awards.length} total`}><div className="space-y-2">{shown.awards.map((award, index) => isEditing ? <AwardEditor key={award.id} award={award} onChange={(patch) => updateAward(index, patch)} onRemove={() => removeAward(index)} /> : <AwardRow key={award.id} award={award} />)}{!shown.awards.length && <p className="text-sm text-black/40">No awards added yet.</p>}{isEditing && <button onClick={addAward} className="mt-2 flex items-center gap-1.5 text-xs font-black text-[#326eac]"><Plus className="h-3.5 w-3.5" /> Add award</button>}</div></ProfileBlock>
      </div>
    </div>}

    {tab === 'sales' && <div className="grid gap-5 lg:grid-cols-2"><ProfileBlock title="Sales highlights">{isEditing ? <Textarea value={shown.highlights.join('\n')} onChange={(value) => update('highlights', safeArray(value))} rows={9} /> : <ul className="space-y-3">{shown.highlights.map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>}</ProfileBlock><ProfileBlock title="Production / vineyard notes">{isEditing ? <><label className="field-label">Production notes</label><Textarea value={shown.productionNotes || ''} onChange={(value) => update('productionNotes', value)} rows={5} /><label className="field-label mt-4">Vineyard notes</label><Textarea value={shown.vineyardNotes || ''} onChange={(value) => update('vineyardNotes', value)} rows={5} /></> : <div className="space-y-5"><div><p className="field-label">Production notes</p><p className="profile-copy">{shown.productionNotes || 'No production notes added.'}</p></div><div><p className="field-label">Vineyard notes</p><p className="profile-copy">{shown.vineyardNotes || 'No vineyard notes added.'}</p></div></div>}</ProfileBlock></div>}

    {tab === 'specs' && <div className="grid gap-5 lg:grid-cols-2"><ProfileBlock title="Commerce7 / product facts" badge={shown.source === 'commerce7' ? 'Managed in Commerce7' : 'Editable'}>{shown.source === 'commerce7' && isEditing && <p className="mb-4 rounded-xl bg-[#edf5fd] p-3 text-xs leading-5 text-[#285f96]">Product name, vintage, varietal, appellation, UPC, price and bottle size stay managed in Commerce7. Wine Hub-specific technical and sales fields remain editable here.</p>}<div className="grid gap-4 sm:grid-cols-2">{isEditing && shown.source !== 'commerce7' ? <><EditField label="Wine name" value={shown.name} onChange={(value) => update('name', value)} /><EditField label="Vintage" value={shown.vintage} onChange={(value) => update('vintage', value)} /><EditField label="Varietal" value={shown.varietal || ''} onChange={(value) => update('varietal', value)} /><EditField label="Appellation" value={shown.appellation || ''} onChange={(value) => update('appellation', value)} /><EditField label="UPC" value={shown.upc || ''} onChange={(value) => update('upc', value)} /><EditField label="SRP" value={shown.price === undefined ? '' : String(shown.price)} onChange={(value) => update('price', value ? Number(value) : undefined)} /><EditField label="Volume mL" value={shown.volumeMl === undefined ? '' : String(shown.volumeMl)} onChange={(value) => update('volumeMl', value ? Number(value) : undefined)} /></> : <><QuickFact label="Wine name" value={shown.name} /><QuickFact label="Vintage" value={shown.vintage} /><QuickFact label="Varietal" value={shown.varietal || '—'} /><QuickFact label="Appellation" value={shown.appellation || '—'} /><QuickFact label="UPC" value={shown.upc ? formatUpc(shown.upc) : '—'} /><QuickFact label="SRP" value={money(shown.price)} /><QuickFact label="Volume" value={shown.volumeMl ? `${shown.volumeMl} mL` : '—'} /></>}</div></ProfileBlock><ProfileBlock title="Tech data"><div className="grid gap-4 sm:grid-cols-2">{isEditing ? <><EditField label="ABV" value={shown.abv || ''} onChange={(value) => update('abv', value)} /><EditField label="Residual sugar" value={shown.rs || ''} onChange={(value) => update('rs', value)} /><EditField label="TA" value={shown.ta || ''} onChange={(value) => update('ta', value)} /><EditField label="pH" value={shown.ph || ''} onChange={(value) => update('ph', value)} /><EditField label="Case pack" value={shown.casePack || ''} onChange={(value) => update('casePack', value)} /><EditField label="Cases produced" value={shown.casesProduced || ''} onChange={(value) => update('casesProduced', value)} /><EditField label="Sweetness" value={shown.sweetness || ''} onChange={(value) => update('sweetness', value)} /></> : <><QuickFact label="ABV" value={shown.abv || '—'} /><QuickFact label="RS" value={shown.rs || '—'} /><QuickFact label="TA" value={shown.ta || '—'} /><QuickFact label="pH" value={shown.ph || '—'} /><QuickFact label="Case pack" value={shown.casePack || '—'} /><QuickFact label="Cases produced" value={shown.casesProduced || '—'} /><QuickFact label="Sweetness" value={shown.sweetness || '—'} /></>}</div></ProfileBlock></div>}

    {tab === 'assets' && <WineProfileAssets wine={shown} />}
  </div>;
}

function WineProfileAssets({ wine }: { wine: WineRecord }) {
  const images = wineImageAssets(wine);
  const lifestyleImages = lifestyleAssetsForWine(wine);
  const packaging = casePackagingForWine(wine);
  const upc = normalizeUpcA(wine.upc || '');
  const upcSvg = upc.valid ? upcASvg(wine.upc || '') : '';
  const upcDataUrl = upc.valid ? upcASvgDataUrl(wine.upc || '') : '';
  const vintage = wine.vintage && wine.vintage !== 'NV' ? `-${wine.vintage}` : '';
  const caseFilename = assetName(`${wine.name}${vintage}-Case-Packaging`);
  const upcFilename = assetName(`${wine.name}${vintage}-UPC-${upc.digits || 'Barcode'}`);

  return <div className="space-y-5">
    <ProfileBlock title="Bottle images" badge={images.length ? `${images.length} image${images.length === 1 ? '' : 's'}` : undefined}>
      {images.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{images.map((asset, index) => {
        const label = asset.role === 'front' ? 'Front bottle image' : asset.role === 'back' ? 'Back bottle image' : `Additional bottle image ${index + 1}`;
        const filename = assetFileBase(wine, asset.role, index);
        return <div key={asset.id || `${asset.src}-${index}`} className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <div className="flex h-72 items-center justify-center bg-[#f3f5f7] p-4"><img src={asset.src} alt={`${wine.name} ${label}`} className="h-full w-full object-contain" /></div>
          <div className="p-4"><p className="text-sm font-black">{label}</p><p className="mt-1 text-[10px] leading-4 text-black/45">Download a clean copy in the format your sales or design team needs.</p><div className="mt-3 flex gap-2"><button onClick={() => void downloadImageAsFormat(asset.src, 'png', filename)} className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> PNG</button><button onClick={() => void downloadImageAsFormat(asset.src, 'jpeg', filename)} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black"><Download className="h-3.5 w-3.5" /> JPEG</button></div></div>
        </div>;
      })}</div> : <p className="text-sm text-black/40">No bottle images are attached to this Commerce7 product.</p>}
    </ProfileBlock>

    <ProfileBlock title="Case Packaging" badge={packaging ? 'Approved case' : undefined}>
      {packaging ? <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-black/10 bg-[#f3f5f7] p-5"><img src={packaging.src} alt={`${wine.name} case packaging`} className="max-h-[360px] w-full object-contain" /></div>
        <div><p className="text-base font-black">{packaging.label}</p><p className="mt-2 max-w-xl text-xs leading-5 text-black/45">This is the same approved case artwork Wine Hub automatically offers in the Tech Sheet Builder for this wine.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void downloadImageAsFormat(packaging.src, 'png', caseFilename)} className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> PNG</button><button onClick={() => void downloadImageAsFormat(packaging.src, 'jpeg', caseFilename)} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black"><Download className="h-3.5 w-3.5" /> JPEG</button></div></div>
      </div> : <div className="rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-5 py-8 text-center"><ImageIcon className="mx-auto h-7 w-7 text-black/20" /><p className="mt-2 text-sm font-bold text-black/45">No case packaging is associated with this wine.</p><p className="mt-1 text-xs text-black/35">If an approved case is added later, it can appear here and in the Tech Sheet Builder automatically.</p></div>}
    </ProfileBlock>

    <ProfileBlock title="UPC Barcode" badge={upc.valid ? 'UPC-A' : undefined}>
      {wine.upc ? upc.valid ? <div className="grid gap-5 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-center">
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white p-5"><img src={upcDataUrl} alt={`UPC barcode ${upc.formatted}`} className="mx-auto w-full max-w-[460px]" /></div>
        <div><p className="text-xs font-black uppercase tracking-[.12em] text-black/35">Commerce7 UPC</p><p className="mt-1 text-xl font-black tracking-[.08em]">{upc.formatted}</p><p className="mt-3 max-w-xl text-xs leading-5 text-black/45">Wine Hub creates standard UPC-A artwork directly from the UPC stored in Commerce7. Use SVG for packaging/design work, or PNG/JPEG for everyday sales files.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void downloadImageAsFormat(upcDataUrl, 'png', upcFilename)} className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> PNG</button><button onClick={() => downloadTextFile(upcSvg, 'image/svg+xml;charset=utf-8', `${upcFilename}.svg`)} className="flex items-center gap-1.5 rounded-lg bg-[#326eac] px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> SVG</button><button onClick={() => void downloadImageAsFormat(upcDataUrl, 'jpeg', upcFilename)} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black"><Download className="h-3.5 w-3.5" /> JPEG</button></div></div>
      </div> : <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-black text-amber-900">UPC artwork could not be created.</p><p className="mt-1 text-xs leading-5 text-amber-800">{upc.reason} Wine Hub will not silently change the Commerce7 UPC.</p><p className="mt-2 font-mono text-xs text-amber-900">{wine.upc}</p></div> : <div className="rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-5 py-8 text-center"><p className="text-sm font-bold text-black/45">No UPC is stored for this wine in Commerce7.</p><p className="mt-1 text-xs text-black/35">Once a UPC is added there, the downloadable barcode will appear here automatically.</p></div>}
    </ProfileBlock>

    <ProfileBlock title="Wine Lifestyle Images" badge={lifestyleImages.length ? `${lifestyleImages.length} image${lifestyleImages.length === 1 ? '' : 's'}` : undefined}>
      {lifestyleImages.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{lifestyleImages.map((asset, index) => {
        const filename = `${wine.name}${vintage}-Lifestyle-${index + 1}`.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        return <div key={`${asset.src}-${index}`} className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <a href={asset.src} target="_blank" rel="noreferrer" className="block aspect-[4/3] overflow-hidden bg-[#f3f5f7]"><img src={asset.src} alt={`${wine.name} lifestyle image ${index + 1}`} className="h-full w-full object-cover transition duration-200 hover:scale-[1.015]" /></a>
          <div className="p-4"><p className="text-sm font-black">Lifestyle image {index + 1}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-black/45">{asset.title}</p><div className="mt-3 flex gap-2"><button onClick={() => void downloadImageAsFormat(asset.src, 'png', filename)} className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> PNG</button><button onClick={() => void downloadImageAsFormat(asset.src, 'jpeg', filename)} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black"><Download className="h-3.5 w-3.5" /> JPEG</button></div></div>
        </div>;
      })}</div> : <div className="rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-5 py-8 text-center"><ImageIcon className="mx-auto h-7 w-7 text-black/20" /><p className="mt-2 text-sm font-bold text-black/45">No lifestyle images added yet.</p><p className="mt-1 text-xs text-black/35">This section is ready for approved photography tied to this wine.</p></div>}
    </ProfileBlock>

    <ProfileBlock title="Links"><div className="space-y-3">{wine.productUrl && <a className="flex items-center gap-2 text-sm font-bold text-[#326eac]" href={wine.productUrl} target="_blank" rel="noreferrer">Open product page <ExternalLink className="h-4 w-4" /></a>}<p className="text-xs leading-5 text-black/45">Wine Hub reads the product photo gallery and UPC from Commerce7, adds approved case packaging when available, and matches approved lifestyle photography to the wine by product name and brand.</p></div></ProfileBlock>
  </div>;
}

function ProfileBlock({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-black uppercase tracking-[.08em]">{title}</h2>{badge && <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] text-black/45">{badge}</span>}</div>{children}</section>;
}
function QuickFact({ label, value }: { label: string; value: string }) { return <div><dt className="text-[10px] font-black uppercase tracking-[.12em] text-black/35">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value}</dd></div>; }
function EditField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="field-label">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="field-input" /></label>; }
function Textarea({ value, onChange, rows, placeholder }: { value: string; onChange: (value: string) => void; rows: number; placeholder?: string }) { return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="field-input resize-y leading-6 placeholder:text-black/25" />; }

type InlineFormat = 'bold' | 'underline' | 'highlight';
function RichTextEditor({ value, onChange, minHeight = 132, placeholder, mode = 'paragraph' }: { value: string; onChange: (value: string) => void; minHeight?: number; placeholder?: string; mode?: 'paragraph' | 'highlights' }) {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = ref.current;
    if (!editor) return;
    const next = formattedCopyHtml(value).replace(/<br \/>/g, '<br>');
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  const readEditor = () => {
    const editor = ref.current;
    if (!editor) return '';

    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent || '');
      if (!(node instanceof HTMLElement)) return '';
      const children = Array.from(node.childNodes).map(walk).join('');
      const tag = node.tagName.toLowerCase();
      if (tag === 'strong' || tag === 'b') return `<strong>${children}</strong>`;
      if (tag === 'u') return `<u>${children}</u>`;
      if (tag === 'mark') return `<mark>${children}</mark>`;
      if (tag === 'br') return '<br>';
      if (tag === 'div' || tag === 'p') return `${children}<br>`;
      return children;
    };

    return Array.from(editor.childNodes)
      .map(walk)
      .join('')
      .replace(/(?:<br>\s*){3,}/g, '<br><br>')
      .replace(/(?:<br>\s*)+$/g, '')
      .trim();
  };

  const emit = () => onChange(readEditor());

  const applyFormat = (format: InlineFormat) => {
    const editor = ref.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed || !editor.contains(range.commonAncestorContainer)) return;

    const wrapper = document.createElement(format === 'bold' ? 'strong' : format === 'underline' ? 'u' : 'mark');
    try {
      range.surroundContents(wrapper);
    } catch {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.addRange(nextRange);
    emit();
  };

  const clearFormatting = () => {
    const editor = ref.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed || !editor.contains(range.commonAncestorContainer)) return;

    // Remove only the formatting from the selected text, including partial selections
    // inside a bold/underline/highlight span. Text and line breaks stay in place.
    const fragment = range.extractContents();
    const formattedNodes = Array.from(fragment.querySelectorAll('strong, b, u, mark')).reverse();
    formattedNodes.forEach((node) => node.replaceWith(...Array.from(node.childNodes)));
    range.insertNode(fragment);
    selection.removeAllRanges();
    editor.focus();
    emit();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.execCommand('insertLineBreak');
      emit();
    }
  };

  const buttonClass = 'flex h-8 min-w-8 items-center justify-center rounded-md border border-black/10 bg-white px-2 text-[11px] font-black text-black/70 shadow-sm hover:bg-black/[.04]';

  return <div>
    <div className="mb-2 flex items-center gap-1.5">
      <span className="mr-1 text-[9px] font-black uppercase tracking-[.12em] text-black/35">Format</span>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('bold')} className={buttonClass} title="Bold selected text"><span className="text-sm font-black">B</span></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('underline')} className={buttonClass} title="Underline selected text"><span className="text-sm font-black underline">U</span></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('highlight')} className={buttonClass} title="Highlight selected text"><span className="rounded-sm bg-[#fff1a8] px-1 text-[10px] font-black">HL</span></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={clearFormatting} className={buttonClass} title="Remove bold, underline and highlight from selected text"><span className="text-[10px] font-black">Clear</span></button>
      <span className="ml-1 text-[9px] leading-3 text-black/35">Select text to add or clear formatting.</span>
    </div>
    <div className="relative">
      {!plainFormattedText(value) && placeholder && <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-black/25">{placeholder}</span>}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyDown={onKeyDown}
        className="field-input overflow-y-auto whitespace-pre-wrap leading-6"
        style={{ minHeight }}
        aria-label={mode === 'highlights' ? 'Highlights editor' : 'Tasting notes editor'}
      />
    </div>
  </div>;
}
function AwardRow({ award }: { award: Award }) {
  const graphic = award.graphicUrl || awardGraphicFor(award);
  return <div className="flex items-center gap-3 rounded-xl bg-[#faf6ea] p-3">{graphic ? <img src={graphic} alt="" className="h-12 w-12 shrink-0 object-contain" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d7a33d] text-white"><AwardIcon className="h-4 w-4" /></span>}<div><p className="text-sm font-black">{award.result}</p><p className="text-[11px] leading-4 text-black/45">{award.year} · {award.competition}</p></div></div>;
}
function AwardEditor({ award, onChange, onRemove }: { award: Award; onChange: (patch: Partial<Award>) => void; onRemove: () => void }) { return <div className="rounded-xl border border-[#ead9b4] bg-[#fffaf0] p-3"><div className="grid gap-2 sm:grid-cols-[90px_1fr]"><label><span className="field-label">Year</span><input type="number" value={award.year} onChange={(event) => onChange({ year: Number(event.target.value) || new Date().getFullYear() })} className="field-input" /></label><EditField label="Result" value={award.result} onChange={(value) => onChange({ result: value })} /></div><div className="mt-2"><EditField label="Competition" value={award.competition} onChange={(value) => onChange({ competition: value })} /></div><div className="mt-2"><EditField label="Award graphic URL (optional)" value={award.graphicUrl || ''} onChange={(value) => onChange({ graphicUrl: value || undefined })} /></div><button onClick={onRemove} className="mt-3 text-[11px] font-black text-red-600 hover:text-red-700">Remove award</button></div>; }


function QuickFactsView() {
  return <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">
    <PageHeader eyebrow="Tasting room" title="Leelanau Cellars Quick Facts" description="A staff reference for the winery story, northern Michigan growing conditions, vineyard sites, grape varieties, sustainability practices and recent vintages." />

    <div className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5fd] text-[#326eac]"><BookOpen className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3976b7]">Company</p><h2 className="text-xl font-black">{QUICK_FACTS.story.title}</h2></div></div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-black/68">{QUICK_FACTS.story.bullets.map((item) => <li key={item} className="flex gap-3"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" /><span>{item}</span></li>)}</ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{QUICK_FACTS.story.brands.map(([brand, detail]) => <div key={brand} className="rounded-xl bg-[#f6f7f8] p-4"><p className="text-sm font-black">{brand}</p><p className="mt-1 text-xs leading-5 text-black/58">{detail}</p></div>)}</div>
      </section>

      <div className="grid gap-5">
        {[QUICK_FACTS.region, QUICK_FACTS.growing].map((section) => <section key={section.title} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-black">{section.title}</h2><ul className="mt-4 space-y-2.5 text-sm leading-6 text-black/65">{section.bullets.map((item) => <li key={item} className="flex gap-3"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BA3F8]" /><span>{item}</span></li>)}</ul></section>)}
      </div>
    </div>

    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3976b7]">68.5 total acres</p><h2 className="text-xl font-black">Our Vineyard Sites</h2></div><p className="max-w-xl text-xs leading-5 text-black/45">{QUICK_FACTS.vineyardNote}</p></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-black/10 text-[10px] font-black uppercase tracking-[.14em] text-black/40"><th className="pb-3 pr-4">Site</th><th className="pb-3 pr-4">Key Features</th><th className="pb-3">Vineyards</th></tr></thead><tbody>{QUICK_FACTS.vineyards.map((item) => <tr key={item.site} className="border-b border-black/[.06] last:border-0"><td className="py-3 pr-4 font-black">{item.site}</td><td className="py-3 pr-4 text-black/62">{item.features}</td><td className="py-3 font-bold">{item.vineyards}</td></tr>)}</tbody></table></div>
    </section>

    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-black">Grape Varieties Grown</h2>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-black/10 text-[9px] font-black uppercase tracking-[.13em] text-black/40"><th className="pb-3 pr-4">Variety</th><th className="pb-3 pr-4">Type</th><th className="pb-3 pr-4">Acreage</th><th className="pb-3 pr-4">Location(s)</th><th className="pb-3">Notes</th></tr></thead><tbody>{QUICK_FACTS.varieties.map((item) => <tr key={item.variety} className="border-b border-black/[.06] align-top last:border-0"><td className="py-3 pr-4 font-black">{item.variety}</td><td className="py-3 pr-4 text-black/55">{item.type}</td><td className="py-3 pr-4 font-bold">{item.acreage}</td><td className="py-3 pr-4 text-black/55">{item.locations}</td><td className="py-3 text-black/55">{item.notes}</td></tr>)}</tbody></table></div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3"><FactMini title="Hilltop white hybrid trial" text={QUICK_FACTS.trials.white} /><FactMini title="Hilltop red hybrid trial" text={QUICK_FACTS.trials.red} /><FactMini title="Coming Soon" text={QUICK_FACTS.trials.comingSoon} /></div>
    </section>

    <div className="mt-5 grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-black">Sustainable Practices</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-black/65">{QUICK_FACTS.sustainability.map((item) => <li key={item} className="flex gap-3"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /><span>{item}</span></li>)}</ul></section>
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-black">Vintage Vineyard Summaries</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{QUICK_FACTS.vintages.map((vintage) => <div key={vintage.year} className="rounded-xl bg-[#f6f7f8] p-4"><p className="text-lg font-black">{vintage.year}</p><ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-black/58">{vintage.bullets.map((item) => <li key={item}>• {item}</li>)}</ul></div>)}</div></section>
    </div>
  </div>;
}

function FactMini({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-black/[.07] bg-[#fafafa] p-4"><p className="text-xs font-black">{title}</p><p className="mt-1.5 text-[11px] leading-5 text-black/55">{text}</p></div>;
}

function menuCandidates(wine: WineRecord) {
  const withoutBrand = wine.name.replace(/^(Leelanau Cellars|Farm Fresh|Country Crush|Lakeshore Farms|Zilly)\s+/i, '').trim();
  const withoutVintage = withoutBrand.replace(/^20\d{2}\s+|\s+20\d{2}$/g, '').trim();
  return Array.from(new Set([wine.name, withoutBrand, withoutVintage, `${wine.vintage} ${withoutVintage}`]))
    .map((value) => normalize(value))
    .filter((value) => value.length >= 5);
}

function matchMenuText(text: string, wines: WineRecord[]) {
  const lines = text.split(/\r?\n/).map((line) => normalize(line)).filter(Boolean);
  const whole = normalize(text);
  return wines.filter((wine) => menuCandidates(wine).some((candidate) => {
    if (candidate.length < 7) return lines.some((line) => line === candidate || line.endsWith(candidate) || line.startsWith(candidate));
    return whole.includes(candidate) || lines.some((line) => line.includes(candidate));
  }));
}

function TastingRoom({ wines, selected, setSelected, openWine, saveMenu, savingMenu, commerce7Connected, role }: { wines: WineRecord[]; selected: string[]; setSelected: (ids: string[]) => void; openWine: (wine: WineRecord) => void; saveMenu: () => void | Promise<void>; savingMenu: boolean; commerce7Connected: boolean; role: AccessRole }) {
  const [q, setQ] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [importNotice, setImportNotice] = useState('');
  const [menuInfo, setMenuInfo] = useState<{ filename: string; updatedAt: string; source: string; storageConfigured: boolean; canReplace: boolean; downloadUrl: string; viewUrl: string } | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuUploading, setMenuUploading] = useState(false);
  const [menuUploadNotice, setMenuUploadNotice] = useState('');
  const chosen = wines.filter((wine) => selected.includes(wine.id));
  const available = wines.filter((wine) => `${wine.name} ${wine.vintage} ${wine.category}`.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((wineId) => wineId !== id) : [...selected, id]);
  const autoSelect = (text = menuText) => {
    const matches = matchMenuText(text, wines);
    setSelected(matches.map((wine) => wine.id));
    setImportNotice(matches.length ? `Matched ${matches.length} wines from the menu.` : 'No wine names matched yet. Try pasting the menu text or use Add / change wines.');
  };
  const useOfficialMenu = () => {
    const matches = matchMenuText(CURRENT_TASTING_MENU_TEXT, wines);
    setSelected(matches.map((wine) => wine.id));
    setImportNotice(matches.length ? `Loaded ${matches.length} wines from the current tasting-room menu.` : 'Wine Hub could not match the current menu against the catalog yet.');
    window.localStorage.setItem(MENU_VERSION_KEY, CURRENT_TASTING_MENU_VERSION);
  };
  const readMenuFile = async (file?: File) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (file.type.startsWith('text/') || ['.txt', '.csv', '.md', '.html'].some((extension) => lower.endsWith(extension))) {
      const text = await file.text();
      setMenuText(text);
      autoSelect(text);
      return;
    }
    setImportNotice('Use the Current Tasting Room Menu card above for the official PDF. For a separate auto-match, paste menu text here or upload TXT, CSV, Markdown, or HTML.');
  };

  async function loadMenuInfo() {
    setMenuLoading(true);
    try {
      const response = await fetch('/api/tasting-room/menu', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load menu information.');
      setMenuInfo(data);
    } catch (error) {
      setMenuUploadNotice(error instanceof Error ? error.message : 'Unable to load current menu.');
    } finally {
      setMenuLoading(false);
    }
  }

  async function replaceOfficialMenu(file?: File) {
    if (!file || menuUploading) return;
    setMenuUploading(true);
    setMenuUploadNotice('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/tasting-room/menu', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to replace the current menu.');
      setMenuUploadNotice('Current menu PDF updated. Update the Staff Notes wine list below if the wines changed.');
      await loadMenuInfo();
    } catch (error) {
      setMenuUploadNotice(error instanceof Error ? error.message : 'Unable to replace the current menu.');
    } finally {
      setMenuUploading(false);
    }
  }

  useEffect(() => { void loadMenuInfo(); }, []);

  const menuDate = menuInfo?.updatedAt ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(menuInfo.updatedAt)) : CURRENT_TASTING_MENU_LABEL;

  return <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">
    <div className="no-print"><PageHeader eyebrow="Tasting room" title="Staff Notes" description="The current tasting-room menu drives the staff wine list, so everyone has quick talking points for the wines being poured right now." right={<div className="flex flex-wrap gap-2"><button onClick={() => void saveMenu()} disabled={savingMenu} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold shadow-sm disabled:cursor-wait disabled:opacity-60">{savingMenu ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {savingMenu ? 'Saving…' : 'Save Staff Notes list'}</button><button onClick={() => printWithTitle(`Leelanau Cellars - Tasting Room Staff Notes - ${new Date().toISOString().slice(0, 10)}`)} className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white"><Printer className="h-4 w-4" /> Print Staff Notes</button></div>} /></div>

    <section className="no-print mb-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5fd] text-[#326eac]"><FileText className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3976b7]">Official PDF</p><h2 className="mt-1 text-xl font-black">Current Tasting Room Menu</h2><p className="mt-1 text-xs leading-5 text-black/48">{menuLoading ? 'Loading menu…' : `${menuInfo?.source === 'vercel-blob' ? 'Uploaded' : CURRENT_TASTING_MENU_LABEL} · ${menuDate}`}</p></div></div>
        <div className="flex flex-wrap gap-2">
          <a href={menuInfo?.viewUrl || '/api/tasting-room/menu?inline=1'} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black"><ExternalLink className="h-4 w-4" /> View PDF</a>
          <a href={menuInfo?.downloadUrl || '/api/tasting-room/menu?download=1'} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black"><Download className="h-4 w-4" /> Download PDF</a>
          <button onClick={useOfficialMenu} className="flex items-center gap-2 rounded-xl bg-[#326eac] px-4 py-3 text-xs font-black text-white"><ClipboardList className="h-4 w-4" /> Use menu for Staff Notes</button>
          {role === 'admin' && <label className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black ${menuInfo?.storageConfigured ? 'cursor-pointer bg-black text-white' : 'cursor-not-allowed bg-black/10 text-black/35'}`}><Upload className="h-4 w-4" /> {menuUploading ? 'Uploading…' : 'Replace Menu'}<input type="file" accept="application/pdf,.pdf" disabled={!menuInfo?.storageConfigured || menuUploading} className="hidden" onChange={(event) => { void replaceOfficialMenu(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>}
        </div>
      </div>
      {role === 'admin' && menuInfo && !menuInfo.storageConfigured && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900"><strong>The current September menu is already bundled and downloadable.</strong> To replace the PDF from inside Wine Hub later, connect Vercel Blob to the project. Until then, you can replace the bundled menu in a future app update.</p>}
      {menuUploadNotice && <p className="mt-3 rounded-xl bg-[#f6f7f8] px-3 py-2.5 text-[11px] font-bold leading-5 text-black/60">{menuUploadNotice}</p>}
    </section>

    <div className="no-print grid gap-5 xl:grid-cols-[390px_1fr]">
      <aside className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className={`mb-4 rounded-xl p-3 text-xs leading-5 ${commerce7Connected ? 'bg-emerald-50 text-emerald-800' : 'bg-[#edf5fd] text-[#285f96]'}`}><strong>{commerce7Connected ? 'Shared Staff Notes list enabled.' : 'Local Staff Notes list.'}</strong> {commerce7Connected ? 'Save the list once and the current selection follows the team.' : 'The wine selection is saved in this browser until Commerce7 is connected.'}</div>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="font-black">Wines on Staff Notes</h2><p className="text-xs text-black/45">{selected.length} wines selected</p></div>{selected.length > 0 && <button onClick={() => setSelected([])} className="text-xs font-bold text-black/40 hover:text-black">Clear</button>}</div>
        <div className="space-y-2">{chosen.length ? chosen.map((wine) => <div key={wine.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#eef5fb] px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-bold">{wine.name}</p><p className="text-[10px] text-black/40">{wine.vintage === 'NV' ? wine.category : `${wine.vintage} · ${wine.category}`}</p></div><button onClick={() => toggle(wine.id)} aria-label={`Remove ${wine.name}`} className="rounded-full p-1 text-black/35 hover:bg-white hover:text-black"><X className="h-3.5 w-3.5" /></button></div>) : <div className="rounded-xl border border-dashed border-black/15 p-5 text-center text-xs leading-5 text-black/40">No wines selected yet. Use the official current menu above to build this list in one click.</div>}</div>
        <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => { setShowImport(!showImport); setShowPicker(false); }} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-black"><FileText className="h-4 w-4" /> Match text</button><button onClick={() => { setShowPicker(!showPicker); setShowImport(false); }} className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-black text-white"><Plus className="h-4 w-4" /> Add / change</button></div>

        {showImport && <div className="mt-4 rounded-xl border border-black/10 bg-[#fafafa] p-3"><p className="text-xs font-black">Auto-select from menu text</p><p className="mt-1 text-[11px] leading-4 text-black/45">Paste a wine list or upload a text-based menu. Wine Hub matches names against the Commerce7 catalog.</p><textarea value={menuText} onChange={(event) => setMenuText(event.target.value)} rows={7} placeholder="Paste a tasting-room wine list here…" className="field-input mt-3 resize-y text-xs leading-5" /><div className="mt-2 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Upload text file<input type="file" accept=".txt,.csv,.md,.html,text/plain,text/csv,text/html" className="hidden" onChange={(event) => void readMenuFile(event.target.files?.[0])} /></label><button onClick={() => autoSelect()} className="rounded-lg bg-[#326eac] px-3 py-2 text-[11px] font-black text-white">Match wines</button></div>{importNotice && <p className="mt-2 text-[10px] leading-4 text-black/50">{importNotice}</p>}</div>}

        {showPicker && <div className="mt-4"><div className="relative mb-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search the wine library…" className="field-input pl-9" /></div><div className="max-h-[430px] space-y-1 overflow-auto pr-1">{available.map((wine) => <label key={wine.id} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 ${selected.includes(wine.id) ? 'bg-[#eaf3fb]' : 'hover:bg-black/[.035]'}`}><input type="checkbox" checked={selected.includes(wine.id)} onChange={() => toggle(wine.id)} className="h-4 w-4 accent-black" /><div className="min-w-0"><p className="truncate text-sm font-bold">{wine.name}</p><p className="text-[11px] text-black/40">{wine.vintage} · {wine.category}</p></div></label>)}</div></div>}
      </aside>
      <TastingGuide chosen={chosen} openWine={openWine} />
    </div>
    <div className="print-root hidden print:block"><TastingGuide chosen={chosen} /></div>
  </div>;
}

function TastingGuide({ chosen, openWine }: { chosen: WineRecord[]; openWine?: (wine: WineRecord) => void }) {
  const categoryRank = (wine: WineRecord) => {
    const category = guideCategoryFor(wine);
    const index = GUIDE_CATEGORY_ORDER.indexOf(category);
    return index === -1 ? GUIDE_CATEGORY_ORDER.length : index;
  };
  const sorted = [...chosen].sort((a, b) => categoryRank(a) - categoryRank(b) || a.name.localeCompare(b.name));
  const pageSize = 10;
  const pages = sorted.length ? Array.from({ length: Math.ceil(sorted.length / pageSize) }, (_, index) => sorted.slice(index * pageSize, (index + 1) * pageSize)) : [[]];
  const today = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  const renderWine = (wine: WineRecord) => {
    const salesHighlights = wine.highlights.length ? wine.highlights : [wine.tastingNotes || wine.shortDescription].filter(Boolean);
    const category = guideCategoryFor(wine);
    return <article key={wine.id} className="field-guide-wine group relative flex min-h-0 flex-col border-b border-black/10 py-2.5 pl-3 pr-1 last:border-b-0">
      <div className="absolute bottom-2 left-0 top-2 w-[3px] bg-[#5BA3F8]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="field-guide-category text-[7px] font-black uppercase tracking-[.16em] text-[#3976b7]">{category}</p>
          <h3 className="field-guide-name mt-0.5 text-[13px] font-black leading-[1.08] tracking-[-.025em]">{wine.name} <span className="font-semibold text-black/30">{wine.vintage === 'NV' ? '' : wine.vintage}</span></h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="field-guide-price text-[11px] font-black leading-none">{money(wine.price)}</p>
          {wine.abv && <p className="mt-1 text-[7px] font-bold text-black/35">{wine.abv} ABV</p>}
        </div>
      </div>
      <div className="mt-2 min-h-0 flex-1">
        <p className="mb-1 text-[6.5px] font-black uppercase tracking-[.14em] text-black/30">Sales highlights</p>
        <ul className="field-guide-highlights space-y-1 pl-3 text-[8px] leading-[1.28] text-black/68">
          {salesHighlights.slice(0, 2).map((item, index) => <li key={`${wine.id}-highlight-${index}`} className="list-disc">{item}</li>)}
        </ul>
        {wine.awards[0] && <p className="field-guide-award mt-1.5 flex items-center gap-1 text-[6.5px] font-black uppercase leading-3 text-[#9a6d17]"><AwardIcon className="h-2.5 w-2.5 shrink-0" /> {wine.awards[0].result} · {wine.awards[0].year}</p>}
      </div>
      <div className="field-guide-notes mt-2">
        <p className="text-[6.5px] font-black uppercase tracking-[.14em] text-black/30">Staff notes</p>
        <div className="field-guide-note-lines mt-1"><div /><div /></div>
      </div>
      {openWine && <button onClick={() => openWine(wine)} className="no-print mt-2 text-left text-[9px] font-black text-[#326eac]">Open wine profile →</button>}
    </article>;
  };

  return <div className="field-guide-pages space-y-5 print:space-y-0">
    {pages.map((pageWines, pageIndex) => {
      const left = pageWines.slice(0, 5);
      const right = pageWines.slice(5, 10);
      return <section key={`guide-page-${pageIndex}`} className="field-guide-page overflow-hidden bg-white shadow-xl print:shadow-none">
        <header className="field-guide-header flex items-center justify-between border-b-[5px] border-[#5BA3F8] px-6 py-4">
          <div className="flex items-center gap-4">
            <img src="/lwc-logo.png" alt="" className="h-12 w-12 border border-black bg-white object-cover" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[.23em] text-[#3976b7]">Leelanau Cellars · Staff Reference</p>
              <h2 className="mt-0.5 text-[23px] font-black tracking-[-.035em]">Tasting Room Staff Notes</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-black/65">{today}</p>
            <p className="mt-1 text-[8px] font-semibold text-black/35">{chosen.length} wines · Page {pageIndex + 1} of {pages.length}</p>
          </div>
        </header>
        {!pageWines.length ? <div className="flex min-h-[560px] items-center justify-center p-10 text-center text-sm text-black/40">Use the current tasting-room menu to build the Staff Notes list.</div> : <div className="field-guide-body grid grid-cols-2 divide-x divide-black/10">
          <div className="field-guide-column grid grid-rows-5 px-5 py-3">{left.map(renderWine)}</div>
          <div className="field-guide-column grid grid-rows-5 px-5 py-3">{right.map(renderWine)}</div>
        </div>}
        <footer className="field-guide-footer flex items-center justify-between bg-[#f3f6f8] px-6 py-2 text-[7px] font-semibold text-black/35">
          <span>Use these highlights as a starting point. Add your own tasting-room notes below each wine.</span>
          <span>lwc.wine · 231-386-5201</span>
        </footer>
      </section>;
    })}
  </div>;
}
function TechSheetBuilder({ wines, activeWine, activeWineId, setActiveWineId, draft, setDraft }: {
  wines: WineRecord[];
  activeWine?: WineRecord;
  activeWineId: string;
  setActiveWineId: (id: string) => void;
  draft: TechSheetDraft;
  setDraft: React.Dispatch<React.SetStateAction<TechSheetDraft>>;
}) {
  const [colorStatus, setColorStatus] = useState('');
  const update = <K extends keyof TechSheetDraft>(key: K, value: TechSheetDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const automaticCasePackaging = casePackagingForWine(activeWine);
  const commerce7TastingNotes = shortCommerce7TastingNotes(activeWine);
  const commerce7Highlights = commerce7SalesHighlights(activeWine);

  const setWine = (id: string) => {
    setActiveWineId(id);
    const wine = wines.find((item) => item.id === id);
    if (wine) setDraft(draftFromWine(wine));
  };

  const loadImageFile = (file: File | undefined, key: 'awardGraphic' | 'casePackagingImage' | 'bottleImage' | 'displayImage') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : undefined;
      setDraft((current) => ({
        ...current,
        [key]: value,
        ...(key === 'bottleImage' ? { autoHeaderColor: true } : {}),
      }));
    };
    reader.readAsDataURL(file);
  };

  const applyBottleColor = async () => {
    if (!draft.bottleImage) return;
    setColorStatus('Matching label color…');
    const color = await prominentLabelColor(draft.bottleImage);
    if (color) {
      setDraft((current) => ({ ...current, headerColor: color, autoHeaderColor: true }));
      setColorStatus('Matched from the bottle label.');
    } else {
      setColorStatus('Could not sample this image. Choose a color manually.');
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!draft.autoHeaderColor || !draft.bottleImage) return;
    setColorStatus('Matching label color…');
    const source = draft.bottleImage;
    void prominentLabelColor(source).then((color) => {
      if (cancelled) return;
      if (!color) {
        setColorStatus('Could not sample this image. Choose a color manually.');
        return;
      }
      setDraft((current) => current.autoHeaderColor && current.bottleImage === source ? { ...current, headerColor: color } : current);
      setColorStatus('Matched from the bottle label.');
    });
    return () => { cancelled = true; };
  }, [draft.bottleImage, draft.autoHeaderColor, setDraft]);

  const setManualHeaderColor = (value: string) => {
    setDraft((current) => ({ ...current, headerColor: value, autoHeaderColor: false }));
    setColorStatus('Manual header color.');
  };

  return <div className="tech-builder flex min-h-screen flex-col bg-[#dfe2e6] xl:h-screen xl:min-h-0 xl:overflow-hidden">
    <div className="no-print flex flex-col border-b border-black/10 bg-white px-4 py-3 xl:flex-row xl:items-center xl:justify-between xl:px-6">
      <div className="flex items-center gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3976b7]">Tech sheet builder</p><p className="text-sm font-black">Document overrides never change Commerce7</p></div></div>
      <div className="mt-3 flex flex-wrap items-center gap-2 xl:mt-0">
        <select value={activeWineId} onChange={(event) => setWine(event.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold">{wines.map((wine) => <option key={wine.id} value={wine.id}>{wine.name} · {wine.vintage}</option>)}</select>
        <button onClick={() => activeWine && setDraft(draftFromWine(activeWine))} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold"><RefreshCw className="h-3.5 w-3.5" /> Start over</button>
        <button onClick={() => printWithTitle(`Leelanau Cellars - ${activeWine?.name || draft.wineName}${activeWine?.vintage && activeWine.vintage !== 'NV' ? ` ${activeWine.vintage}` : ''} - Tech Sheet`)} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white"><Download className="h-3.5 w-3.5" /> Print / Save PDF</button>
      </div>
    </div>

    <div className="no-print grid flex-1 min-h-0 items-start xl:grid-cols-[390px_minmax(0,1fr)] xl:overflow-hidden">
      <aside className="min-h-full border-r border-black/10 bg-white p-5 xl:h-full xl:min-h-0 xl:overflow-y-auto">
        <div className="mb-5 rounded-xl bg-[#edf5fd] p-3 text-xs leading-5 text-[#285f96]"><strong>Product facts, tasting notes and highlights are already filled in.</strong> Sales can edit anything for a specific customer without changing Commerce7.</div>
        <div className="space-y-5">
          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Header color</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">By default Wine Hub tries to match the most prominent color on the bottle label. You can turn that off and choose any color instead.</p>
            <div className="mt-3 flex items-center gap-2">
              <input type="color" value={/^#[0-9a-f]{6}$/i.test(draft.headerColor) ? draft.headerColor : TECH_COLOR} onChange={(event) => setManualHeaderColor(event.target.value)} className="h-10 w-14 rounded-lg border border-black/10 bg-white p-1" />
              <input value={draft.headerColor} onChange={(event) => setManualHeaderColor(event.target.value)} className="field-input" />
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"><span className="text-[11px] font-black">Auto-match bottle label</span><input type="checkbox" checked={draft.autoHeaderColor} onChange={(event) => setDraft((current) => ({ ...current, autoHeaderColor: event.target.checked }))} className="h-4 w-4 accent-black" /></label>
            <div className="mt-2 flex flex-wrap items-center gap-2"><button onClick={() => void applyBottleColor()} disabled={!draft.bottleImage} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black disabled:opacity-40">Match bottle label now</button>{colorStatus && <span className="text-[10px] font-semibold text-black/40">{colorStatus}</span>}</div>
          </div>

          <EditField label="Wine name" value={draft.wineName} onChange={(value) => update('wineName', value)} />

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Tasting notes</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">Wine Hub starts with a short sales-ready version of the Commerce7 copy. Edit it directly, and use the formatting buttons without any visible markup characters.</p>
            <div className="mt-3"><RichTextEditor value={draft.tastingNotes} onChange={(value) => update('tastingNotes', value)} minHeight={132} placeholder="Type your tasting notes here…" /></div>
            <button onClick={() => update('tastingNotes', commerce7TastingNotes)} disabled={!commerce7TastingNotes} className="mt-2 rounded-md bg-[#009b72] px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm transition hover:bg-[#007f5e] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35 disabled:shadow-none">Refresh from Commerce7</button>
          </div>

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Highlights</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">Wine Hub starts with the two strongest Commerce7 selling points. Keep one highlight per line and edit or format them as needed.</p>
            <div className="mt-3"><RichTextEditor value={draft.highlights.join('<br>')} onChange={(value) => update('highlights', splitRichLines(value))} minHeight={164} placeholder="Type one highlight per line…" mode="highlights" /></div>
            <button onClick={() => update('highlights', [...commerce7Highlights])} disabled={!commerce7Highlights.length} className="mt-2 rounded-md bg-[#009b72] px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm transition hover:bg-[#007f5e] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35 disabled:shadow-none">Refresh from Commerce7</button>
          </div>

          <div>
            <p className="mb-2 text-xs font-black">Wine Specs</p>
            <div className="grid grid-cols-2 gap-3"><EditField label="ABV" value={draft.abv} onChange={(value) => update('abv', value)} /><EditField label="SRP" value={draft.srp} onChange={(value) => update('srp', value)} /></div>
            <div className="mt-3"><EditField label="Case size" value={draft.casePack} onChange={(value) => update('casePack', value)} /></div>
            <div className="mt-3"><EditField label="UPC" value={draft.upc} onChange={(value) => update('upc', value)} /></div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <EditField label="Cost (Distributor)" value={draft.distributorCost} onChange={(value) => update('distributorCost', value)} />
              <EditField label="Cost (Retailer)" value={draft.retailerCost} onChange={(value) => update('retailerCost', value)} />
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/40">Optional sales-only fields. Leave either one blank and it will stay off the finished tech sheet.</p>
          </div>

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Bottle image</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">The Commerce7 bottle image is applied automatically. Upload a different bottle image for this tech sheet if you need one, then adjust the size below.</p>
            <div className="mt-3 space-y-2">
              <EditField label="Bottle / hero image URL" value={draft.bottleImage || ''} onChange={(value) => setDraft((current) => ({ ...current, bottleImage: value || undefined, autoHeaderColor: true }))} />
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Upload bottle image<input type="file" accept="image/*" className="hidden" onChange={(event) => loadImageFile(event.target.files?.[0], 'bottleImage')} /></label>
                {activeWine?.bottleImage && draft.bottleImage !== activeWine.bottleImage && <button onClick={() => setDraft((current) => ({ ...current, bottleImage: activeWine.bottleImage, autoHeaderColor: true }))} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Use Commerce7 bottle image</button>}
              </div>
              <label className="block pt-1"><span className="field-label">Bottle size on sheet · {draft.bottleScale.toFixed(2)}×</span><input type="range" min="0.5" max="4" step="0.05" value={draft.bottleScale} onChange={(event) => update('bottleScale', Number(event.target.value))} className="w-full accent-black" /><span className="mt-1 block text-[10px] leading-4 text-black/40">Starts at 2.55× so the bottle reaches higher into the page by default. Shrink it for wider images or increase it when you want a larger hero bottle.</span></label>
              <label className="block pt-1"><span className="field-label">Bottle vertical position · {draft.bottleOffsetY < 0 ? `${Math.abs(draft.bottleOffsetY)}px higher` : draft.bottleOffsetY > 0 ? `${draft.bottleOffsetY}px lower` : 'centered'}</span><input type="range" min="-140" max="80" step="5" value={draft.bottleOffsetY} onChange={(event) => update('bottleOffsetY', Number(event.target.value))} className="w-full accent-black" /><span className="mt-1 block text-[10px] leading-4 text-black/40">Use this only when a specific image needs a little vertical adjustment after sizing it.</span></label>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Award badge</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">Wine Hub applies the matching award artwork automatically when it can. You can override the badge for a specific sheet.</p>
            <div className="mt-3 space-y-2"><EditField label="Award graphic URL (optional)" value={draft.awardGraphic || ''} onChange={(value) => update('awardGraphic', value || undefined)} /><label className="inline-flex cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Upload award image<input type="file" accept="image/*" className="hidden" onChange={(event) => loadImageFile(event.target.files?.[0], 'awardGraphic')} /></label></div>
          </div>

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3"><div><p className="text-xs font-black">Case Packaging</p><p className="mt-1 text-[10px] leading-4 text-black/45">If Wine Hub has approved case artwork and the default copy has enough room, Case Packaging starts turned on automatically. Longer sheets leave it off so the main layout stays full-size. You can always turn it on or off manually.</p></div><input type="checkbox" checked={draft.includeCasePackaging} onChange={(event) => setDraft((current) => ({ ...current, includeCasePackaging: event.target.checked, casePackagingImage: event.target.checked && !current.casePackagingImage ? automaticCasePackaging?.src : current.casePackagingImage }))} className="h-4 w-4 accent-black" /></label>
            {automaticCasePackaging && <div className={`mt-2 rounded-lg px-2.5 py-2 text-[10px] font-bold leading-4 ${draft.includeCasePackaging ? 'bg-emerald-50 text-emerald-800' : 'bg-[#edf5fd] text-[#285f96]'}`}>{draft.includeCasePackaging ? `Auto-matched: ${automaticCasePackaging.label}` : `Available: ${automaticCasePackaging.label}. Left off unless you choose to include it.`}</div>}
            {draft.includeCasePackaging && <div className="mt-3 space-y-2">{!automaticCasePackaging && <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] font-bold leading-4 text-amber-800">No automatic case match yet. You can still add an image below.</p>}<EditField label="Packaging image URL · optional override" value={draft.casePackagingImage || ''} onChange={(value) => update('casePackagingImage', value || undefined)} /><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Upload different packaging image<input type="file" accept="image/*" className="hidden" onChange={(event) => loadImageFile(event.target.files?.[0], 'casePackagingImage')} /></label>{automaticCasePackaging && draft.casePackagingImage !== automaticCasePackaging.src && <button onClick={() => update('casePackagingImage', automaticCasePackaging.src)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Use automatic match</button>}</div></div>}
          </div>

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Display</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">Optional. Add a display, floor stack, endcap, or other merchandising image for this tech sheet. If Case Packaging is included, Display appears beside it; otherwise Display slides into that space by itself.</p>
            <div className="mt-3 space-y-2">
              <EditField label="Display image URL · optional" value={draft.displayImage || ''} onChange={(value) => update('displayImage', value || undefined)} />
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Upload display image<input type="file" accept="image/*" className="hidden" onChange={(event) => loadImageFile(event.target.files?.[0], 'displayImage')} /></label>
                {draft.displayImage && <button type="button" onClick={() => update('displayImage', undefined)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Remove display</button>}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
            <p className="text-xs font-black">Footer / sales contact line</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">The standard Leelanau Cellars contact information stays prefilled. Sales can replace it on a specific sheet with their name, phone, email, territory, or other contact details.</p>
            <div className="mt-3"><EditField label="Footer text" value={draft.footer} onChange={(value) => update('footer', value)} /></div>
          </div>
        </div>
      </aside>
      <TechSheetPreview draft={draft} wine={activeWine} />
    </div>
    <div className="print-root hidden print:block"><TechSheetPaper draft={draft} wine={activeWine} /></div>
  </div>;
}

type BrandLogo = { src: string; alt: string; mode: 'square' | 'natural-white' | 'screen-white'; className?: string };

const BRAND_LOGOS: Record<string, BrandLogo> = {
  'Leelanau Cellars': { src: '/lwc-logo.png', mode: 'square', alt: 'Leelanau Cellars' },
  'Farm Fresh': { src: 'https://farmfresh.wine/wp-content/uploads/2021/02/farm-fresh-logo-full-white-03.png', mode: 'natural-white', alt: 'Farm Fresh Wine Company', className: 'max-h-[108px] max-w-[220px]' },
  'Country Crush': { src: 'https://www.lwc.wine/wp-content/uploads/2022/01/Country-Crush-With-Brand_Logo.png', mode: 'screen-white', alt: 'Country Crush Fruit Wine Company', className: 'max-h-[104px] max-w-[245px]' },
  'Zilly': { src: 'https://www.lwc.wine/wp-content/uploads/2025/04/Zilly-Black-Logo-bigger.png', mode: 'screen-white', alt: 'Zilly', className: 'max-h-[92px] max-w-[190px]' },
  'Lakeshore Farms': { src: 'https://www.lwc.wine/wp-content/uploads/2021/05/Website_Logo-03.png', mode: 'screen-white', alt: 'Lakeshore Farms Trading Company', className: 'max-h-[104px] max-w-[215px]' },
};

function brandLogoFor(wine?: WineRecord) {
  const brand = wine?.brand || 'Leelanau Cellars';
  return BRAND_LOGOS[brand] || BRAND_LOGOS['Leelanau Cellars'];
}

function BrandLogoMark({ wine }: { wine?: WineRecord }) {
  const logo = brandLogoFor(wine);
  if (logo.mode === 'square') return <img src={logo.src} alt={logo.alt} className="h-[98px] w-[92px] border-[2px] border-black bg-white object-cover" />;
  const screenStyle = logo.mode === 'screen-white' ? { filter: 'brightness(0) invert(1)', mixBlendMode: 'screen' as const } : undefined;
  return <img src={logo.src} alt={logo.alt} className={`${logo.className || 'max-h-[104px] max-w-[230px]'} object-contain`} style={screenStyle} />;
}

function awardGraphicFor(award: Award) {
  if (!award.competition.toLowerCase().includes('san francisco chronicle')) return undefined;
  const normalized = award.result
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const standard: Record<string, string> = {
    'best of class': 'best-of-class',
    'best in class': 'best-of-class',
    'double gold': 'double-gold',
    gold: 'gold',
    silver: 'silver',
    bronze: 'bronze',
  };
  const sweepstakes: Record<number, Record<string, string>> = {
    2025: {
      'packaging sweepstake': 'sweepstake-packaging',
      'packaging sweepstakes': 'sweepstake-packaging',
      'red sweepstake': 'sweepstake-red',
      'red sweepstakes': 'sweepstake-red',
      'white sweepstake': 'sweepstake-white',
      'white sweepstakes': 'sweepstake-white',
      'rose sweepstake': 'sweepstake-rose',
      'rose sweepstakes': 'sweepstake-rose',
      'sparkling sweepstake': 'sweepstake-sparkling',
      'sparkling sweepstakes': 'sweepstake-sparkling',
      'specialty sweepstake': 'sweepstake-specialty',
      'specialty sweepstakes': 'sweepstake-specialty',
    },
    2026: {
      'sparkling sweepstake': 'sparkling-sweepstake',
      'sparkling sweepstakes': 'sparkling-sweepstake',
      'rose sweepstake': 'rose-sweepstake',
      'rose sweepstakes': 'rose-sweepstake',
      'packaging sweepstake': 'packaging-sweepstake',
      'packaging sweepstakes': 'packaging-sweepstake',
      'specialty sweepstake': 'specialty-sweepstake',
      'specialty sweepstakes': 'specialty-sweepstake',
      'red sweepstake': 'red-sweepstake',
      'red sweepstakes': 'red-sweepstake',
      'white sweepstake': 'white-sweepstake',
      'white sweepstakes': 'white-sweepstake',
    },
  };

  const slug = standard[normalized] || sweepstakes[award.year]?.[normalized];
  if (!slug) return undefined;

  const supported: Record<number, string[]> = {
    2023: ['best-of-class', 'gold', 'silver', 'bronze'],
    2024: ['best-of-class', 'double-gold', 'gold', 'silver', 'bronze'],
    2025: ['best-of-class', 'double-gold', 'gold', 'silver', 'bronze', 'sweepstake-packaging', 'sweepstake-red', 'sweepstake-white', 'sweepstake-rose', 'sweepstake-sparkling', 'sweepstake-specialty'],
    2026: ['best-of-class', 'double-gold', 'gold', 'silver', 'bronze', 'sparkling-sweepstake', 'rose-sweepstake', 'packaging-sweepstake', 'specialty-sweepstake', 'red-sweepstake', 'white-sweepstake'],
  };

  return supported[award.year]?.includes(slug) ? `/awards/${award.year}/${slug}.png` : undefined;
}

function TechSheetPaper({ draft, wine }: { draft: TechSheetDraft; wine?: WineRecord }) {
  const firstAward = wine?.awards[0];
  const compositeColdDuck = draft.bottleImage?.includes('cold-duck-composite');
  const awardGraphic = draft.awardGraphic || (firstAward ? awardGraphicFor(firstAward) : undefined);
  const compact = Boolean(draft.includeCasePackaging || draft.displayImage);

  return <article className="tech-sheet-paper relative flex shrink-0 flex-col overflow-hidden bg-white text-black shadow-2xl print:shadow-none">
    <div className="flex h-[132px] shrink-0 items-center justify-center" style={{ backgroundColor: draft.headerColor }}><BrandLogoMark wine={wine} /></div>
    <div className="flex h-[48px] shrink-0 items-center justify-center" style={{ backgroundColor: mixWithWhite(draft.headerColor, .62) }}><h1 className="text-center text-[30px] font-black uppercase tracking-[-.035em]">{draft.wineName}</h1></div>
    <div className="relative flex-1 overflow-hidden bg-white">
      <div className={`relative z-10 w-[58%] px-[48px] pr-[12px] ${compact ? 'py-[30px]' : 'py-[42px]'}`}>
        <SheetSection title="Tasting Notes" compact={compact}><p className="text-[17px] leading-[1.45]"><FormattedCopy text={draft.tastingNotes} /></p></SheetSection>
        <SheetSection title="Wine Specs" compact={compact}><div className="space-y-[2px] text-[16px] leading-[1.35]"><Spec label="ABV" value={draft.abv} /><Spec label="Case Size" value={draft.casePack} /><Spec label="UPC" value={draft.upc} /><Spec label="Cost (Distributor)" value={draft.distributorCost} /><Spec label="Cost (Retailer)" value={draft.retailerCost} /><Spec label="SRP" value={draft.srp} /></div></SheetSection>
        <SheetSection title="Highlights" compact={compact}>{draft.highlights.length ? <ul className="list-disc space-y-[4px] pl-7 text-[16px] leading-[1.35]">{draft.highlights.map((item, index) => <li key={`${item}-${index}`}><HighlightCopy item={item} /></li>)}</ul> : <div className={compact ? 'min-h-[34px]' : 'min-h-[52px]'} />}</SheetSection>
        {(draft.includeCasePackaging || draft.displayImage) && <div className={`grid items-start ${draft.includeCasePackaging && draft.displayImage ? 'grid-cols-2 gap-5' : 'grid-cols-1'}`}>
          {draft.includeCasePackaging && <SheetSection title="Case Packaging" compact>{draft.casePackagingImage ? <img src={draft.casePackagingImage} alt="Case packaging" className={`${draft.displayImage ? 'max-h-[155px] max-w-[190px]' : 'max-h-[185px] max-w-[350px]'} w-full object-contain object-left`} /> : <div className="no-print flex h-[112px] max-w-[320px] items-center justify-center rounded-lg border border-dashed border-black/20 text-[11px] font-bold text-black/30">Add a packaging image in the builder</div>}</SheetSection>}
          {draft.displayImage && <SheetSection title="Display" compact><img src={draft.displayImage} alt="Display" className={`${draft.includeCasePackaging ? 'max-h-[155px] max-w-[190px]' : 'max-h-[185px] max-w-[350px]'} w-full object-contain object-left`} /></SheetSection>}
        </div>}
      </div>

      <div className="absolute bottom-0 right-0 top-0 w-[42%] overflow-hidden">
        {draft.bottleImage ? <img src={draft.bottleImage} alt="" className="absolute inset-0 h-full w-full origin-bottom object-contain object-bottom" style={{ transform: `translateY(${draft.bottleOffsetY ?? 0}px) scale(${draft.bottleScale})` }} /> : <div className="absolute inset-8 flex items-center justify-center rounded-2xl border-2 border-dashed border-black/15 text-sm font-bold text-black/25">Bottle image</div>}
        {firstAward && !compositeColdDuck && (awardGraphic
          ? <img src={awardGraphic} alt={`${firstAward.result} award`} className="absolute left-[4px] top-[15%] z-20 h-[132px] w-[132px] object-contain drop-shadow-md" />
          : <AwardBadge award={firstAward} />)}
      </div>
    </div>
    <footer className="flex h-[32px] shrink-0 items-center justify-center bg-black px-6 text-center text-[12px] font-medium text-white">{draft.footer}</footer>
  </article>;
}

function TechSheetPreview({ draft, wine }: { draft: TechSheetDraft; wine?: WineRecord }) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(.72);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateScale = () => {
      const rect = frame.getBoundingClientRect();
      const availableWidth = Math.max(0, rect.width - 48);
      const availableHeight = Math.max(0, rect.height - 48);
      const next = Math.min(1, availableWidth / 816, availableHeight / 1056);
      setScale(Number.isFinite(next) && next > 0 ? next : .72);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return <div ref={frameRef} className="flex min-h-[720px] items-center justify-center overflow-hidden p-6 xl:h-full xl:min-h-0 xl:p-6">
    <div className="shrink-0" style={{ width: 816 * scale, height: 1056 * scale }}>
      <div style={{ width: 816, height: 1056, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TechSheetPaper draft={draft} wine={wine} />
      </div>
    </div>
  </div>;
}

function mixWithWhite(hex: string, amount: number) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return TECH_LIGHT;
  const rgb = [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16));
  const mixed = rgb.map((channel) => Math.round(channel + (255 - channel) * amount));
  return `rgb(${mixed.join(',')})`;
}
function SheetSection({ title, children, compact = false }: { title: string; children: React.ReactNode; compact?: boolean }) { return <section className={compact ? 'mb-[19px]' : 'mb-[28px]'}><h2 className="mb-[7px] text-[25px] font-black uppercase tracking-[-.015em]">{title}</h2>{children}</section>; }
function Spec({ label, value }: { label: string; value: string }) { if (!value) return null; return <p><strong>{label}:</strong> {value}</p>; }
function AwardBadge({ award }: { award: Award }) {
  return <div className="absolute left-[8px] top-[16%] z-20 w-[132px] rounded-xl border border-[#d7a33d]/50 bg-white/95 p-3 text-center shadow-lg">
    <AwardIcon className="mx-auto h-5 w-5 text-[#b27d16]" />
    <p className="mt-1 text-[13px] font-black uppercase leading-4 text-[#8f6312]">{award.result}</p>
    <p className="mt-1 text-[9px] font-bold leading-3 text-black/50">{award.year}<br />San Francisco Chronicle</p>
  </div>;
}

function AwardsView({ wines, openWine }: { wines: WineRecord[]; openWine: (wine: WineRecord) => void }) {
  const withAwards = wines.filter((wine) => wine.awards.length).sort((a, b) => (b.awards[0]?.year ?? 0) - (a.awards[0]?.year ?? 0) || a.name.localeCompare(b.name));
  const total = withAwards.reduce((sum, wine) => sum + wine.awards.length, 0);
  return <div className="no-print mx-auto max-w-[1320px] p-5 md:p-8 xl:p-10"><PageHeader eyebrow="Recognition" title="Awards Library" description="Awards live with the wine record, so the same medal can feed tech sheets, tasting-room guides and sales talking points." right={<Stat value={total} label="awards" />} /><div className="grid gap-4 lg:grid-cols-2">{withAwards.map((wine) => <button key={wine.id} onClick={() => openWine(wine)} className="rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#3976b7]">{wine.brand}</p><h2 className="mt-1 text-xl font-black">{wine.name} <span className="font-semibold text-black/30">{wine.vintage === 'NV' ? '' : wine.vintage}</span></h2></div><AwardIcon className="h-6 w-6 text-[#c28d25]" /></div><div className="space-y-2">{wine.awards.map((award) => <AwardRow key={award.id} award={award} />)}</div></button>)}</div></div>;
}

function AssetsView({ wines, openWine }: { wines: WineRecord[]; openWine: (wine: WineRecord) => void }) {
  const assets = wines.filter((wine) => wineImageAssets(wine).length || lifestyleAssetsForWine(wine).length || casePackagingForWine(wine) || wine.upc);
  return <div className="no-print mx-auto max-w-[1320px] p-5 md:p-8 xl:p-10">
    <PageHeader eyebrow="Approved creative" title="Asset Library" description="Bottle photography, lifestyle images, approved case packaging and downloadable UPC barcode artwork for each wine." />
    <section className="mb-7 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"><div className="flex items-center gap-4"><img src="/lwc-logo.png" alt="" className="h-20 w-20 border border-black" /><div><p className="text-sm font-black">Leelanau Cellars square logo</p><p className="mt-1 text-xs text-black/45">Used automatically on the sales tech-sheet template.</p></div></div></section>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{assets.map((wine) => {
      const images = wineImageAssets(wine);
      const lifestyle = lifestyleAssetsForWine(wine);
      const packaging = casePackagingForWine(wine);
      const upc = normalizeUpcA(wine.upc || '');
      const preview = images[0]?.src || lifestyle[0]?.src || packaging?.src;
      const extras = [packaging ? 'case' : '', upc.valid ? 'UPC' : ''].filter(Boolean).join(' · ');
      return <div key={wine.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <button onClick={() => openWine(wine)} className="block w-full text-left"><div className="flex h-52 items-center justify-center bg-[#f2f4f6]">{preview && <img src={preview} alt="" className="h-full w-full object-contain p-4" />}</div><div className="p-4"><p className="font-black">{wine.name}</p><p className="mt-1 text-xs text-black/40">{wine.vintage} · {images.length} bottle · {lifestyle.length} lifestyle{extras ? ` · ${extras}` : ''}</p></div></button>
        <div className="flex border-t border-black/10 p-2"><button onClick={() => openWine(wine)} className="flex-1 rounded-lg px-3 py-2 text-xs font-bold text-[#326eac] hover:bg-[#eaf3fb]">View / download assets</button></div>
      </div>;
    })}</div>
  </div>;
}

