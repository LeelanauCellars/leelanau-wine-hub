'use client';

import './central.css';

import React, { useEffect, useMemo, useState } from 'react';
import NextImage from 'next/image';
import { SEED_WINES } from '@/lib/seed';
import type { Award, TechSheetDraft, WineRecord } from '@/lib/types';
import { casePackagingForWine } from '@/lib/case-packaging';
import { lifestyleAssetsForWine } from '@/lib/lifestyle-assets';
import { posDisplaysForWine } from '@/lib/pos-displays';
import { normalizeUpcA, upcASvg, upcASvgDataUrl } from '@/lib/upc';
import { CURRENT_TASTING_MENU_LABEL, CURRENT_TASTING_MENU_TEXT, CURRENT_TASTING_MENU_VERSION, QUICK_FACTS } from '@/lib/tasting-room-content';
import { staffFlavorProfile, staffReferenceForWine, staffStyleLabel, vintageViticultureForWine } from '@/lib/staff-notes-data';
import { DISTRIBUTION_WINES, type DistributionWine } from '@/lib/distribution-wines';
import { applyWineHubOverrides, buildDistributionCatalog, DISTRIBUTION_EDITS_KEY, matchWineByName } from '@/lib/catalog-overrides';
import MerchApparel from '@/app/components/MerchApparel';
import { WINE_COLLECTIONS, canonicalWineCollection, collectionForWine, distributionFamilyFallback, type WineCollectionName } from '@/lib/wine-collections';

type IconProps = React.SVGProps<SVGSVGElement>;
const Icon = ({ children, ...props }: IconProps) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
const Search = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const AwardIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="5"/><path d="m8.5 12.5-2 8 5.5-3 5.5 3-2-8"/></Icon>;
const Check = (p: IconProps) => <Icon {...p}><path d="m5 12 4 4L19 6"/></Icon>;
const ChevronLeft = (p: IconProps) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const ClipboardList = (p: IconProps) => <Icon {...p}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></Icon>;
const Database = (p: IconProps) => <Icon {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></Icon>;
const Package = (p: IconProps) => <Icon {...p}><path d="m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></Icon>;
const Briefcase = (p: IconProps) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></Icon>;
const Store = (p: IconProps) => <Icon {...p}><path d="M4 10v10h16V10M3 4h18l-2 6H5zM8 20v-6h8v6"/></Icon>;
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
type PortalRole = 'admin' | 'tasting' | 'sales' | 'distribution';
type EntryStage = 'welcome' | 'roles' | 'hub';
type View = 'library' | 'profile' | 'distribution' | 'distribution-profile' | 'tasting' | 'merch' | 'quickfacts' | 'tech-library' | 'tech' | 'awards' | 'assets';
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
  const [wines, setWines] = useState<WineRecord[]>(applyWineHubOverrides(SEED_WINES));
  const [activeWineId, setActiveWineId] = useState(SEED_WINES[0].id);
  const [activeDistributionId, setActiveDistributionId] = useState(DISTRIBUTION_WINES[0]?.id || '');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [wineCollection, setWineCollection] = useState<WineCollectionName | null>(null);
  const [distributionCollection, setDistributionCollection] = useState<WineCollectionName | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');
  const [editingWine, setEditingWine] = useState<WineRecord | null>(null);
  const [techDraft, setTechDraft] = useState<TechSheetDraft>(() => draftFromWine(SEED_WINES[0]));
  const [tastingIds, setTastingIds] = useState<string[]>([]);
  const [needsCurrentMenuSeed, setNeedsCurrentMenuSeed] = useState(false);
  const [access, setAccess] = useState<{ loading: boolean; enabled: boolean; configured: boolean; role: AccessRole | null }>({ loading: true, enabled: false, configured: false, role: null });
  const [entryStage, setEntryStage] = useState<EntryStage>('welcome');
  const [portalRole, setPortalRole] = useState<PortalRole | null>(null);
  const [sync, setSync] = useState<SyncState>({ configured: false, loading: false, message: 'Checking Commerce7…' });
  const [mobileNav, setMobileNav] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savingMaster, setSavingMaster] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [savingMenu, setSavingMenu] = useState(false);
  const [distributionEdits, setDistributionEdits] = useState<Record<string, Partial<DistributionWine>>>({});

  const distributionWines = useMemo(() => buildDistributionCatalog(wines, DISTRIBUTION_WINES, distributionEdits), [wines, distributionEdits]);
  const activeWine = wines.find((wine) => wine.id === activeWineId) ?? wines[0];
  const activeDistributionWine = distributionWines.find((wine) => wine.id === activeDistributionId) ?? distributionWines[0];
  const isPortalAdmin = portalRole === 'admin';
  const canUseWineLibrary = portalRole === 'admin' || portalRole === 'tasting' || portalRole === 'sales';
  const canUseDistribution = portalRole === 'admin' || portalRole === 'sales' || portalRole === 'distribution';
  const canUseTechSheets = portalRole === 'admin' || portalRole === 'sales';
  const canUseTastingRoom = portalRole === 'admin' || portalRole === 'tasting';
  const canUseMerch = portalRole === 'admin' || portalRole === 'tasting';
  const canUseQuickFacts = portalRole === 'admin' || portalRole === 'tasting' || portalRole === 'sales';
  const canUseAwards = portalRole === 'admin' || portalRole === 'sales';

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setWines(applyWineHubOverrides(JSON.parse(saved)));
      const savedDistributionEdits = window.localStorage.getItem(DISTRIBUTION_EDITS_KEY);
      if (savedDistributionEdits) setDistributionEdits(JSON.parse(savedDistributionEdits));
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
    window.localStorage.setItem(DISTRIBUTION_EDITS_KEY, JSON.stringify(distributionEdits));
  }, [distributionEdits, hydrated]);

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
    if (entryStage === 'hub' && portalRole) void checkCommerce7();
  }, [entryStage, portalRole]);

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

  function enterPortal(role: PortalRole) {
    setPortalRole(role);
    setMobileNav(false);
    setEditingWine(null);
    setQuery('');
    setCategory('All');
    setWineCollection(null);
    setDistributionCollection(null);
    setView(role === 'distribution' ? 'distribution' : 'library');
    setEntryStage('hub');
  }

  function switchPortal() {
    setMobileNav(false);
    setEditingWine(null);
    setPortalRole(null);
    setEntryStage('roles');
  }

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
    setPortalRole(null);
    setEntryStage('welcome');
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
      const nextWines = applyWineHubOverrides(mergeCommerce7(wines, remoteWines));
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

  function openDistributionWine(wine: DistributionWine) {
    setActiveDistributionId(wine.id);
    setView('distribution-profile');
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
      setWines((current) => applyWineHubOverrides(current.map((wine) => wine.id === saved.id ? saved : wine))); 
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

  function saveDistributionWine(next: DistributionWine) {
    setDistributionEdits((current) => ({
      ...current,
      [next.id]: {
        ...current[next.id],
        name: next.name,
        family: next.family,
        iriDescription: next.iriDescription,
        upcFull: next.upcFull,
        upc10: next.upc10,
        gtin: next.gtin,
        meijerPid: next.meijerPid,
        targetDpci: next.targetDpci,
        marketingCopy: next.marketingCopy,
        specs: next.specs,
        pricing: next.pricing,
      },
    }));
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
      const collectionMatch = !wineCollection || collectionForWine(wine) === wineCollection;
      const categoryMatch = category === 'All' || wine.category === category;
      const searchMatch = !q || `${wine.name} ${wine.vintage} ${wine.varietal ?? ''} ${wine.category} ${wine.brand} ${wine.vendor ?? ''} ${wine.collection ?? ''}`.toLowerCase().includes(q);
      return collectionMatch && categoryMatch && searchMatch;
    });
  }, [wines, query, category, wineCollection]);

  if (access.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]"><div className="text-center"><img src="/lwc-logo.png" alt="Leelanau Cellars" className="mx-auto h-16 w-16 border border-black bg-white object-cover" /><Loader2 className="mx-auto mt-5 h-6 w-6 animate-spin text-black/40" /><p className="mt-3 text-sm font-bold text-black/45">Opening Wine Hub…</p></div></div>;
  }

  if (access.enabled && !access.role) {
    return <PinGate configured={access.configured} onAccess={(role) => { setAccess({ loading: false, enabled: true, configured: true, role }); setView('library'); }} />;
  }

  if (entryStage === 'welcome') {
    return <WelcomePage onEnter={() => setEntryStage('roles')} />;
  }

  if (entryStage === 'roles' || !portalRole) {
    return <PortalChooser onChoose={enterPortal} onBack={() => setEntryStage('welcome')} />;
  }

  return (
    <div className="app-shell min-h-screen bg-white text-[#111]">
      <aside className={`no-print fixed inset-y-0 left-0 z-40 w-[292px] border-r border-black/[.08] bg-white transition-transform lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col overflow-y-auto px-4 pb-4 pt-7">
          <div className="mb-6 flex items-start justify-between px-1">
            <button type="button" onClick={switchPortal} className="rounded-xl text-left transition hover:opacity-75" title="Back to portal" aria-label="Back to portal">
              <img src="/portal/logo.svg" alt="Leelanau Cellars" width="972" height="1017" className="central-sidebar-logo" />
            </button>
            <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
          </div>

          <nav className="space-y-2" aria-label="Section navigation">
            {canUseWineLibrary && <NavButton active={view === 'library' || view === 'profile'} icon={<Library />} label={portalRole === 'tasting' ? 'Wines' : 'Wine Library'} onClick={() => { setView('library'); setMobileNav(false); }} />}
            {canUseDistribution && <NavButton active={view === 'distribution' || view === 'distribution-profile'} icon={<Package />} label="Distribution Wines" onClick={() => { setView('distribution'); setMobileNav(false); }} />}
            {canUseMerch && <NavButton active={view === 'merch'} icon={<Package />} label="Merch/Apparel" onClick={() => { setView('merch'); setMobileNav(false); }} />}
            {canUseTastingRoom && <NavButton active={view === 'tasting'} icon={<ClipboardList />} label="Tasting Menu and Notes" onClick={() => { setView('tasting'); setMobileNav(false); }} />}
            {canUseQuickFacts && <NavButton active={view === 'quickfacts'} icon={<BookOpen />} label="Quick Facts" onClick={() => { setView('quickfacts'); setMobileNav(false); }} />}
            {canUseTechSheets && <NavButton active={view === 'tech-library' || view === 'tech'} icon={<FileText />} label="Tech Sheets" onClick={() => { setView('tech-library'); setMobileNav(false); }} />}
            {canUseAwards && <NavButton active={view === 'awards'} icon={<AwardIcon />} label="Awards" onClick={() => { setView('awards'); setMobileNav(false); }} />}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-black/10 bg-white p-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.16em] text-black/35">Portal</p>
                <p className="mt-1 text-xs font-black">{portalRole === 'admin' ? 'Admin' : portalRole === 'sales' ? 'Sales' : portalRole === 'tasting' ? 'Tasting Room' : 'Distributors'}</p>
              </div>
              {access.enabled && <button onClick={() => void logout()} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/10 px-2.5 py-2 text-[10px] font-black text-black/55 hover:bg-black/[.04]"><LogOut className="h-3.5 w-3.5" /> Log out</button>}
            </div>
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

      <main className="min-h-screen lg:pl-[292px]">
        <div className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/10 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setMobileNav(true)} className="rounded-lg border border-black/10 p-2"><Menu className="h-5 w-5" /></button>
          <span className="font-bold">Leelanau Cellars Central · {portalRole === 'distribution' ? 'Distributors' : portalRole === 'tasting' ? 'Tasting Room' : portalRole === 'sales' ? 'Sales' : 'Admin'}</span>
        </div>

        {view === 'library' && canUseWineLibrary && (
          <WineLibrary wines={filteredWines} allWines={wines} categories={categories} query={query} setQuery={setQuery} category={category} setCategory={setCategory} collection={wineCollection} setCollection={setWineCollection} openWine={openWine} openTech={openTech} sync={sync} allowTechSheets={canUseTechSheets} />
        )}
        {view === 'profile' && canUseWineLibrary && activeWine && (
          <WineProfile wine={activeWine} distributionWines={distributionWines} tab={profileTab} setTab={setProfileTab} editing={editingWine} setEditing={setEditingWine} save={saveMasterWine} saving={savingMaster} saveNotice={saveNotice} addAward={addAwardToEditing} back={() => setView('library')} openTech={() => openTech(activeWine)} allowTechSheets={canUseTechSheets} />
        )}
        {view === 'distribution' && canUseDistribution && (
          <DistributionLibrary wines={wines} distributionWines={distributionWines} collection={distributionCollection} setCollection={setDistributionCollection} openWine={openDistributionWine} />
        )}
        {view === 'distribution-profile' && canUseDistribution && activeDistributionWine && (
          <DistributionWineDetail item={activeDistributionWine} wines={wines} back={() => setView('distribution')} canEdit={isPortalAdmin} saveItem={saveDistributionWine} />
        )}
        {view === 'merch' && canUseMerch && <MerchApparel isAdmin={isPortalAdmin} />}
        {view === 'tasting' && canUseTastingRoom && (
          <TastingRoom wines={wines} selected={tastingIds} setSelected={setTastingIds} openWine={openWine} saveMenu={saveTastingMenu} savingMenu={savingMenu} commerce7Connected={sync.configured} role={(isPortalAdmin ? 'admin' : 'tasting') as AccessRole} />
        )}
        {view === 'quickfacts' && canUseQuickFacts && <QuickFactsView />}
        {view === 'tech-library' && canUseTechSheets && (
          <TechSheetLibrary wines={wines} openTech={openTech} />
        )}
        {view === 'tech' && canUseTechSheets && (
          <TechSheetBuilder wines={wines} activeWine={activeWine} activeWineId={activeWineId} setActiveWineId={setActiveWineId} draft={techDraft} setDraft={setTechDraft} back={() => setView('tech-library')} />
        )}
        {view === 'awards' && canUseAwards && <AwardsView wines={wines} openWine={openWine} />}
      </main>
    </div>
  );
}


function PortalArrow() {
  return <span aria-hidden="true" className="central-arrow"><svg viewBox="0 0 32 32" fill="none"><path d="M7 16h18M17 8l8 8-8 8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
}

function WelcomePage({ onEnter }: { onEnter: () => void }) {
  return <main className="central-entry"><div className="central-entry-content">
    <img src="/portal/logo.svg" alt="Leelanau Cellars" width="972" height="1017" className="central-entry-logo" />
    <button onClick={onEnter} className="central-enter-button"><span>ENTER</span><PortalArrow /></button>
  </div></main>;
}

function PortalChooser({ onChoose, onBack }: { onChoose: (role: PortalRole) => void; onBack: () => void }) {
  const options: { role: PortalRole; label: string; image: string }[] = [
    { role: 'admin', label: 'Admin', image: '/portal/admin-original.png' },
    { role: 'tasting', label: 'Tasting Room', image: '/portal/tasting-room.jpg' },
    { role: 'sales', label: 'Sales', image: '/portal/sales.jpg' },
    { role: 'distribution', label: 'Distributors', image: '/portal/distributors.jpg' },
  ];
  return <main className="central-chooser"><div className="central-chooser-content">
    <img src="/portal/logo.svg" alt="Leelanau Cellars" width="972" height="1017" className="central-chooser-logo" />
    <h1>Welcome to Leelanau Cellars Central</h1>
    <p className="central-subtitle">Select the area that best matches your needs.</p>
    <div className="central-role-grid">{options.map(option => <button key={option.role} onClick={() => onChoose(option.role)} className={`central-role central-role-${option.role}`} aria-label={`Open ${option.label}`}>
      <img src={option.image} alt="" width="600" height="600" className="central-role-photo" />
      <span className="central-role-caption"><span className="central-role-label">{option.role === 'tasting' ? <>Tasting<br />Room</> : option.label}</span><PortalArrow /></span>
    </button>)}</div>
    <button onClick={onBack} className="central-back">Back to Enter</button>
  </div></main>;
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
  return <button onClick={onClick} aria-current={active ? 'page' : undefined} className={`central-nav-button ${active ? 'central-nav-active' : ''}`}>{label}</button>;
}

function PageHeader({ eyebrow, title, description, right }: { eyebrow?: string; title: string; description?: string; right?: React.ReactNode }) {
  return <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div>{eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-[#3976b7]">{eyebrow}</p>}<h1 className="text-3xl font-black tracking-[-.035em] md:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{description}</p>}</div>{right}</header>;
}


const DISTRIBUTION_NAME_ALIASES: Record<string, string> = {
  'witches brew spiced red': 'witches brew',
  'zilly cabernet': 'zilly cabernet sauvignon',
  'great lakes red 750ml': 'great lakes red',
  'great lakes red 1.5l': 'great lakes red',
  'winter white 750ml': 'winter white',
  'winter white 1.5l': 'winter white',
  "summer sunset rose'": 'summer sunset',
  'lakeshore collection red': 'lakeshore collection red blend',
};

function simplifiedDistributionName(value = '') {
  return value
    .toLowerCase()
    .replace(/\b(?:750\s*ml|1\.5\s*l|1500\s*ml)\b/g, ' ')
    .replace(/\b(?:bottle|bottles)\b/g, ' ')
    .replace(/^estate\s+/i, '')
    .replace(/^lwc\s+/i, '')
    .replace(/^chills\b/i, 'chill')
    .replace(/\s+/g, ' ')
    .trim();
}

function distributionSizeKey(size?: string | null) {
  const normalized = String(size || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.includes('1.5') || normalized.includes('1500')) return '1500';
  if (normalized.includes('375')) return '375';
  if (normalized.includes('750')) return '750';
  return normalized;
}

function findDistributionWineByHints(wines: WineRecord[], hints: string[], size?: '375' | '750' | '1500') {
  const normalizedHints = hints.map((hint) => normalize(hint)).filter(Boolean);
  return wines.find((wine) => {
    const wineKey = normalize(wine.name);
    const nameMatch = normalizedHints.some((hint) => wineKey.includes(hint) || hint.includes(wineKey));
    if (!nameMatch) return false;
    if (size === '375') return wine.volumeMl === 375 || /\b375\b/i.test(wine.name) || /\bcan\b/i.test(wine.name);
    if (size === '750') return wine.volumeMl === 750 || /\b750\b/i.test(wine.name);
    if (size === '1500') return wine.volumeMl === 1500 || /(?:\b1\.5\b|\b1500\b)/i.test(wine.name);
    return true;
  });
}

function matchedDistributionWine(item: DistributionWine, wines: WineRecord[]) {
  const size = distributionSizeKey(item.specs.size);
  if (size === '375') {
    const itemKey = normalize(item.name);
    const canMatch = itemKey.includes('greatlakesred')
      ? findDistributionWineByHints(wines, ['Great Lakes Red 375', 'Great Lakes Red Can', 'Great Lakes Red'], '375')
      : itemKey.includes('winterwhite')
        ? findDistributionWineByHints(wines, ['Winter White 375', 'Winter White Can', 'Winter White'], '375')
        : itemKey.includes('summersunset')
          ? findDistributionWineByHints(wines, ['Summer Sunset 375', 'Summer Sunset Can', 'Summer Sunset'], '375')
          : undefined;
    if (canMatch) return canMatch;
  }
  return matchWineByName(item.name, wines);
}

function distributionItemForWine(wine: WineRecord, distributionWines: DistributionWine[]) {
  const digits = (value?: string | null) => String(value || '').replace(/\D/g, '');
  const wineUpc = digits(wine.upc);
  if (wineUpc) {
    const exactUpc = distributionWines.find((item) => digits(item.upcFull) === wineUpc);
    if (exactUpc) return exactUpc;
  }

  const expectedSize = wine.volumeMl === 1500 ? '1500' : wine.volumeMl === 375 ? '375' : wine.volumeMl === 750 ? '750' : '';
  const candidates = distributionWines.filter((item) => matchedDistributionWine(item, [wine])?.id === wine.id);
  if (!candidates.length) return undefined;
  if (expectedSize) return candidates.find((item) => distributionSizeKey(item.specs.size) === expectedSize) || candidates[0];
  return candidates[0];
}

const DISTRIBUTION_IMAGE_OVERRIDES: { pattern: RegExp; size: '1500'; src: string }[] = [
  { pattern: /great\s*lakes\s*red/i, size: '1500', src: '/bottles/great-lakes-red-front.png' },
  { pattern: /winter\s*white/i, size: '1500', src: '/bottles/winter-white-front.png' },
  { pattern: /witches\s*brew/i, size: '1500', src: '/bottles/witches-brew-front.png' },
  { pattern: /farm\s*fresh\s*blackberry\s*moscato/i, size: '1500', src: '/bottles/farm-fresh-blackberry-moscato-front.png' },
  { pattern: /farm\s*fresh\s*raspberry\s*moscato/i, size: '1500', src: '/bottles/farm-fresh-raspberry-moscato-front.png' },
  { pattern: /farm\s*fresh\s*cranberry\s*moscato/i, size: '1500', src: '/bottles/farm-fresh-cranberry-moscato-front.png' },
  { pattern: /farm\s*fresh\s*peach\s*moscato/i, size: '1500', src: '/bottles/farm-fresh-peach-moscato-front.png' },
  { pattern: /farm\s*fresh\s*can\s*variety\s*pack/i, size: '1500', src: '/cases/farm-fresh-can-variety-pack.png' },
];

function distributionImageSrc(item: DistributionWine, match: WineRecord | undefined, wines: WineRecord[]) {
  const size = distributionSizeKey(item.specs.size);
  if (/farm\s*fresh\s*can\s*variety\s*pack/i.test(item.name)) {
    return '/cases/farm-fresh-can-variety-pack.png';
  }
  if (size === '1500') {
    const fromAssets = match ? wineImageAssets(match).find((asset) => asset.role === 'front' && /1\.5\s*l/i.test(asset.label || ''))?.src : undefined;
    if (fromAssets) return fromAssets;
    const override = DISTRIBUTION_IMAGE_OVERRIDES.find((entry) => entry.size === '1500' && entry.pattern.test(item.name));
    if (override) return override.src;
  }
  if (size === '375') {
    const canMatch = matchedDistributionWine(item, wines);
    if (canMatch?.bottleImage) return canMatch.bottleImage;
  }
  return match?.bottleImage;
}

function distributionValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
  return String(value);
}

function distributionPercent(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === '') return '—';
  return `${distributionValue(value)}%`;
}

function distributionCollectionForItem(item: DistributionWine, wines: WineRecord[]): WineCollectionName {
  // Distribution workbook family names are intentional brand assignments. Keep those
  // authoritative so a legacy/matched Commerce7 record cannot move a product into
  // another brand collection (for example Lakeshore Farms into Farm Fresh).
  const explicitFamilyCollection = canonicalWineCollection(item.family);
  if (explicitFamilyCollection) return explicitFamilyCollection;

  const match = matchedDistributionWine(item, wines);
  if (match?.vendor) return collectionForWine(match);
  return match ? collectionForWine(match) : distributionFamilyFallback(item.family);
}

function CollectionTiles({ counts, onSelect, noun }: {
  counts: Partial<Record<WineCollectionName, number>>;
  onSelect: (collection: WineCollectionName) => void;
  noun: 'wine' | 'product';
}) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {WINE_COLLECTIONS.map((collection) => {
      const count = counts[collection] || 0;
      return <button key={collection} type="button" onClick={() => onSelect(collection)} disabled={!count} className="group flex min-h-[104px] flex-col justify-between rounded-xl border border-[#b9d7f3] bg-white p-5 text-left text-[#326eac] shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:border-[#7fb8e8] enabled:hover:bg-[#f4f9fe] enabled:hover:shadow-md disabled:cursor-default disabled:opacity-40">
        <h2 className="text-[21px] font-black uppercase leading-[1.05] tracking-[-.02em]">{collection}</h2>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#326eac]/70">{count} {noun}{count === 1 ? '' : 's'}</span>
          <span className="text-sm font-black text-[#326eac]">{count ? '→' : '—'}</span>
        </div>
      </button>;
    })}
  </div>;
}

function DistributionLibrary({ wines, distributionWines, collection, setCollection, openWine }: { wines: WineRecord[]; distributionWines: DistributionWine[]; collection: WineCollectionName | null; setCollection: (value: WineCollectionName | null) => void; openWine: (item: DistributionWine) => void }) {
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('All');
  const currentCount = distributionWines.length;
  const entries = useMemo(() => distributionWines.map((item) => ({ item, collection: distributionCollectionForItem(item, wines) })), [distributionWines, wines]);
  const counts = useMemo(() => Object.fromEntries(WINE_COLLECTIONS.map((name) => [name, entries.filter((entry) => entry.collection === name).length])) as Record<WineCollectionName, number>, [entries]);
  const needle = query.trim().toLowerCase();
  const collectionEntries = useMemo(() => entries.filter((entry) => !collection || entry.collection === collection), [entries, collection]);
  const families = useMemo(() => ['All', ...Array.from(new Set(collectionEntries.map((entry) => entry.item.family))).sort()], [collectionEntries]);

  const filtered = useMemo(() => entries.filter(({ item, collection: itemCollection }) => {
    const collectionMatch = !collection || itemCollection === collection;
    const familyMatch = family === 'All' || item.family === family;
    const haystack = `${item.name} ${item.family} ${itemCollection} ${item.upcFull || ''} ${item.gtin || ''} ${item.meijerPid || ''} ${item.targetDpci || ''} ${item.specs.composition || ''} ${item.marketingCopy || ''}`.toLowerCase();
    return collectionMatch && familyMatch && (!needle || haystack.includes(needle));
  }).map((entry) => entry.item), [entries, collection, family, needle]);

  const chooseCollection = (value: WineCollectionName) => {
    setCollection(value);
    setFamily('All');
    setQuery('');
  };
  const backToCollections = () => {
    setCollection(null);
    setFamily('All');
    setQuery('');
  };
  const showProducts = Boolean(collection) || Boolean(needle);

  return <div className="no-print mx-auto max-w-[1480px] p-5 md:p-8 xl:p-10">
    <PageHeader eyebrow="Distributor resources" title="Distribution Wines" description="Start with a collection, then find product codes, technical specifications, packaging measurements and sales assets for the wine you need." right={<div className="flex gap-2"><Stat value={currentCount} label="current" /></div>} />

    <div className="mb-6">
      <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={collection ? `Search ${collection} products…` : 'Search all distribution products…'} className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none focus:border-black/30" /></div>
    </div>

    {!showProducts ? <section>
      <h2 className="mb-4 text-2xl font-black tracking-[-.03em]">Collections</h2>
      <CollectionTiles counts={counts} onSelect={chooseCollection} noun="product" />
    </section> : <>
      <div className="mb-5 flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div><button type="button" onClick={backToCollections} className="mb-2 flex items-center gap-1 text-[11px] font-black text-[#326eac]"><ChevronLeft className="h-3.5 w-3.5" /> Collections</button><h2 className="text-2xl font-black tracking-[-.03em]">{collection || 'Search Results'}</h2><p className="mt-1 text-xs font-semibold text-black/40">{filtered.length} matching product{filtered.length === 1 ? '' : 's'}</p></div>
        {collection && families.length > 2 && <div className="flex max-w-[760px] gap-2 overflow-x-auto pb-1">{families.map((item) => <button key={item} onClick={() => setFamily(item)} className={`whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-xs font-bold ${family === item ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/60 hover:border-black/25'}`}>{item}</button>)}</div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((item) => {
          const match = matchedDistributionWine(item, wines);
          const itemCollection = distributionCollectionForItem(item, wines);
          const libraryAssets = match ? wineImageAssets(match).length + lifestyleAssetsForWine(match).length + posDisplaysForWine(match).length + (casePackagingForWine(match) ? 1 : 0) + (match.upc ? 1 : 0) : 0;
          const description = item.marketingCopy || (item.specs.composition ? `${item.specs.composition}${item.specs.size ? ` · ${item.specs.size}` : ''}` : 'Open for complete distributor product information.');
          return <article key={item.id} className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <button onClick={() => openWine(item)} className="block w-full text-left">
              <div className="relative h-56 overflow-hidden bg-[#eef2f6]">
                {distributionImageSrc(item, match, wines) ? <img src={distributionImageSrc(item, match, wines)} alt="" className="h-full w-full object-contain object-center p-3 transition duration-300 group-hover:scale-[1.02]" /> : <DistributionPlaceholder item={item} />}
                <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap gap-2"><span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] shadow-sm">{itemCollection}</span>{item.family !== itemCollection && <span className="rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-white">{item.family}</span>}</div>
                {libraryAssets > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-[#326eac] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-white">{libraryAssets} library asset{libraryAssets === 1 ? '' : 's'}</span>}
              </div>
              <div className="p-4"><h2 className="text-lg font-black leading-5">{item.name}</h2><p className="mt-1 text-xs font-semibold text-black/45">{item.specs.size || 'Size not listed'}{item.specs.composition ? ` · ${item.specs.composition}` : ''}</p><p className="mt-3 line-clamp-3 min-h-[60px] text-xs leading-5 text-black/55">{description}</p><div className="mt-3 flex items-center justify-between gap-3"><span className="font-mono text-[10px] font-bold text-black/40">{item.upcFull || 'UPC —'}</span><span className="text-[11px] font-black text-[#326eac]">View distributor info →</span></div></div>
            </button>
          </article>;
        })}
      </div>
      {!filtered.length && <div className="rounded-2xl border border-dashed border-black/20 bg-white py-24 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-black/20" /><p className="font-bold">No distribution products match that search.</p></div>}
    </>}
  </div>;
}

function DistributionPlaceholder({ item }: { item: DistributionWine }) {
  const words = item.name.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 3).map((word) => word[0]).join('').toUpperCase();
  return <div className="flex h-full w-full items-center justify-center p-5"><div className="flex h-32 w-24 flex-col items-center justify-center rounded-[28px_28px_14px_14px] border-2 border-black/10 bg-white text-center shadow-sm"><span className="text-2xl font-black tracking-tight">{initials}</span><span className="mt-2 px-2 text-[8px] font-black uppercase leading-3 tracking-[.12em] text-black/35">{item.family}</span></div></div>;
}

function DistributionWineDetail({ item, wines, back, canEdit, saveItem }: { item: DistributionWine; wines: WineRecord[]; back: () => void; canEdit: boolean; saveItem: (item: DistributionWine) => void }) {
  const match = matchedDistributionWine(item, wines);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  useEffect(() => {
    setDraft(item);
    setEditing(false);
  }, [item.id]);

  const pricingPresent = Object.values(draft.pricing).some((value) => typeof value === 'number');
  const specRows = [
    ['Size', draft.specs.size],
    ['Glass Type', draft.specs.glassType],
    ['ABV', draft.specs.abv === null || draft.specs.abv === undefined ? null : distributionPercent(draft.specs.abv)],
    ['RS', draft.specs.rs === null || draft.specs.rs === undefined ? null : distributionPercent(draft.specs.rs)],
    ['pH', draft.specs.ph],
    ['TA', draft.specs.ta === null || draft.specs.ta === undefined ? null : `${distributionValue(draft.specs.ta)} g/L`],
    ['Composition / Base Grape / Leading Blend', draft.specs.composition],
  ] as const;

  const imperialRows = [
    ['Height (inches)', draft.imperial.height], ['Width (inches)', draft.imperial.width], ['Weight (oz)', draft.imperial.weightOz], ['Weight (lb)', draft.imperial.weightLb], ['Pack', draft.imperial.pack],
    ['Case Height', draft.imperial.caseHeight], ['Case Width', draft.imperial.caseWidth], ['Case Length', draft.imperial.caseLength], ['Case Weight', draft.imperial.caseWeight],
    ['Pallet Cases / Layer', draft.imperial.palletCasesPerLayer], ['Pallet Layers', draft.imperial.palletLayers], ['Pallet Height', draft.imperial.palletHeight], ['Pallet Length', draft.imperial.palletLength], ['Pallet Width', draft.imperial.palletWidth], ['Pallet Weight', draft.imperial.palletWeight],
  ] as const;
  const metricRows = [
    ['Height (cm)', draft.metric.heightCm], ['Width (cm)', draft.metric.widthCm], ['Weight (gram)', draft.metric.weightGram], ['Weight (lb)', draft.metric.weightLb], ['Pack', draft.metric.pack],
    ['Case Height', draft.metric.caseHeight], ['Case Width', draft.metric.caseWidth], ['Case Length', draft.metric.caseLength], ['Case Weight', draft.metric.caseWeight],
    ['Pallet Cases / Layer', draft.metric.palletCasesPerLayer], ['Pallet Layers', draft.metric.palletLayers], ['Pallet Height', draft.metric.palletHeight], ['Pallet Length', draft.metric.palletLength], ['Pallet Width', draft.metric.palletWidth], ['Pallet Weight', draft.metric.palletWeight],
  ] as const;
  const distributionUpcSource = draft.upcFull || draft.upc10 || '';
  const distributionUpc = normalizeUpcA(distributionUpcSource);
  const distributionUpcSvg = distributionUpc.valid ? upcASvg(distributionUpcSource) : '';
  const distributionUpcDataUrl = distributionUpc.valid ? upcASvgDataUrl(distributionUpcSource) : '';
  const distributionUpcFilename = assetName(`${draft.name}-UPC-${distributionUpc.digits || 'Barcode'}`);

  return <div className="no-print mx-auto max-w-[1320px] p-5 md:p-8 xl:p-10">
    <button onClick={back} className="mb-5 flex items-center gap-1.5 text-xs font-bold text-black/50 hover:text-black"><ChevronLeft className="h-4 w-4" /> Distribution Wines</button>
    <div className="mb-6 overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[320px_1fr]">
        <div className="flex min-h-[340px] items-center justify-center bg-[#eef2f6] p-6">{distributionImageSrc(draft, match, wines) ? <img src={distributionImageSrc(draft, match, wines)} alt={draft.name} className="max-h-[320px] w-full object-contain" /> : <DistributionPlaceholder item={draft} />}</div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#edf5fd] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-[#326eac]">{draft.family}</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-emerald-700">Current distribution</span></div>
          <h1 className="mt-4 text-3xl font-black tracking-[-.035em] md:text-4xl">{draft.name}</h1>
          <p className="mt-2 text-sm font-semibold text-black/45">{draft.specs.size || 'Size not listed'}{draft.specs.composition ? ` · ${draft.specs.composition}` : ''}</p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-black/65">{draft.marketingCopy || 'No marketing copy is entered for this product in the distribution workbook.'}</p>
          <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-lg border border-black/10 bg-[#fafbfc] px-3 py-2 font-mono text-xs font-bold">{draft.upcFull || 'UPC not listed'}</span>{draft.gtin && <span className="rounded-lg border border-black/10 bg-[#fafbfc] px-3 py-2 font-mono text-xs font-bold">GTIN {draft.gtin}</span>}</div>
          {canEdit && <div className="mt-5 flex flex-wrap gap-2">
            {!editing ? <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold shadow-sm"><Pencil className="h-4 w-4" /> Edit distributor info</button> : <>
              <button onClick={() => { saveItem(draft); setEditing(false); }} className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white"><Save className="h-4 w-4" /> Save changes</button>
              <button onClick={() => { setDraft(item); setEditing(false); }} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold">Cancel</button>
            </>}
          </div>}
        </div>
      </div>
    </div>

    {editing && canEdit && <div className="mb-5 grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <ProfileBlock title="Edit Distribution Record">
          <div className="grid gap-3">
            <EditField label="Display Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
            <EditField label="Family" value={draft.family} onChange={(value) => setDraft({ ...draft, family: value })} />
            <EditField label="Bottle Size" value={draft.specs.size || ''} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, size: value } })} />
            <EditField label="Glass Type" value={draft.specs.glassType || ''} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, glassType: value } })} />
            <EditField label="ABV" value={draft.specs.abv === null || draft.specs.abv === undefined ? '' : String(draft.specs.abv)} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, abv: value } })} />
            <EditField label="RS" value={draft.specs.rs === null || draft.specs.rs === undefined ? '' : String(draft.specs.rs)} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, rs: value } })} />
            <EditField label="pH" value={draft.specs.ph === null || draft.specs.ph === undefined ? '' : String(draft.specs.ph)} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, ph: value } })} />
            <EditField label="TA (g/L)" value={draft.specs.ta === null || draft.specs.ta === undefined ? '' : String(draft.specs.ta)} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, ta: value } })} />
            <EditField label="Composition" value={draft.specs.composition || ''} onChange={(value) => setDraft({ ...draft, specs: { ...draft.specs, composition: value } })} />
          </div>
        </ProfileBlock>
        <ProfileBlock title="Identity & Codes" badge="Admin editable">
          <div className="grid gap-3">
            <EditField label="IRI Description" value={draft.iriDescription || ''} onChange={(value) => setDraft({ ...draft, iriDescription: value || null })} />
            <EditField label="UPC Full" value={draft.upcFull || ''} onChange={(value) => setDraft({ ...draft, upcFull: value || null })} />
            <EditField label="UPC 10" value={draft.upc10 || ''} onChange={(value) => setDraft({ ...draft, upc10: value || null })} />
            <EditField label="GTIN" value={draft.gtin || ''} onChange={(value) => setDraft({ ...draft, gtin: value || null })} />
            <EditField label="Meijer PID" value={draft.meijerPid || ''} onChange={(value) => setDraft({ ...draft, meijerPid: value || null })} />
            <EditField label="Target DPCI" value={draft.targetDpci || ''} onChange={(value) => setDraft({ ...draft, targetDpci: value || null })} />
          </div>
        </ProfileBlock>
      </div>
      <div className="space-y-5">
        <ProfileBlock title="Marketing Copy">
          <Textarea value={draft.marketingCopy || ''} onChange={(value) => setDraft({ ...draft, marketingCopy: value })} rows={12} placeholder="Add marketing copy that should appear in Distribution Wines." />
        </ProfileBlock>
        <ProfileBlock title="Pricing" badge="Admin editable">
          <div className="grid gap-3 sm:grid-cols-2">
            <EditField label="MI Case" value={draft.pricing.miCase === null || draft.pricing.miCase === undefined ? '' : String(draft.pricing.miCase)} onChange={(value) => setDraft({ ...draft, pricing: { ...draft.pricing, miCase: value ? Number(value) : null } })} />
            <EditField label="MI Bottle" value={draft.pricing.miBottle === null || draft.pricing.miBottle === undefined ? '' : String(draft.pricing.miBottle)} onChange={(value) => setDraft({ ...draft, pricing: { ...draft.pricing, miBottle: value ? Number(value) : null } })} />
            <EditField label="MI SRP" value={draft.pricing.miSrp === null || draft.pricing.miSrp === undefined ? '' : String(draft.pricing.miSrp)} onChange={(value) => setDraft({ ...draft, pricing: { ...draft.pricing, miSrp: value ? Number(value) : null } })} />
            <EditField label="OH Case" value={draft.pricing.ohCase === null || draft.pricing.ohCase === undefined ? '' : String(draft.pricing.ohCase)} onChange={(value) => setDraft({ ...draft, pricing: { ...draft.pricing, ohCase: value ? Number(value) : null } })} />
            <EditField label="OH Bottle" value={draft.pricing.ohBottle === null || draft.pricing.ohBottle === undefined ? '' : String(draft.pricing.ohBottle)} onChange={(value) => setDraft({ ...draft, pricing: { ...draft.pricing, ohBottle: value ? Number(value) : null } })} />
            <EditField label="OH SRP" value={draft.pricing.ohSrp === null || draft.pricing.ohSrp === undefined ? '' : String(draft.pricing.ohSrp)} onChange={(value) => setDraft({ ...draft, pricing: { ...draft.pricing, ohSrp: value ? Number(value) : null } })} />
          </div>
        </ProfileBlock>
      </div>
    </div>}

    <div className="grid gap-5 lg:grid-cols-2">
      <ProfileBlock title="Identity & Codes" badge={`Workbook row ${draft.sourceRow}`}>
        <DistributionFacts rows={[['Item', draft.name], ['IRI Description', draft.iriDescription], ['UPC Full', draft.upcFull], ['UPC 10', draft.upc10], ['GTIN', draft.gtin], ['Meijer PID', draft.meijerPid], ['Target DPCI', draft.targetDpci]]} />
      </ProfileBlock>

      <ProfileBlock title="Wine Specifications">
        <DistributionFacts rows={specRows} />
      </ProfileBlock>

      <ProfileBlock title="Pricing">
        {pricingPresent ? <DistributionFacts rows={[
          ['MI Pricing (Case)', typeof draft.pricing.miCase === 'number' ? money(draft.pricing.miCase) : null],
          ['MI Pricing (Bottle)', typeof draft.pricing.miBottle === 'number' ? money(draft.pricing.miBottle) : null],
          ['MI Pricing SRP', typeof draft.pricing.miSrp === 'number' ? money(draft.pricing.miSrp) : null],
          ['OH Pricing (Case)', typeof draft.pricing.ohCase === 'number' ? money(draft.pricing.ohCase) : null],
          ['OH Pricing (Bottle)', typeof draft.pricing.ohBottle === 'number' ? money(draft.pricing.ohBottle) : null],
          ['OH Pricing SRP', typeof draft.pricing.ohSrp === 'number' ? money(draft.pricing.ohSrp) : null],
        ]} /> : <p className="text-sm leading-6 text-black/45">No MI or OH pricing is entered for this product in the current workbook.</p>}
      </ProfileBlock>

      <ProfileBlock title="Marketing Copy">
        <p className="text-sm leading-7 text-black/65">{draft.marketingCopy || 'No marketing copy entered.'}</p>
      </ProfileBlock>

      <ProfileBlock title="UPC Barcode" badge={distributionUpc.valid ? 'UPC-A' : undefined}>
        {(draft.upcFull || draft.upc10) ? distributionUpc.valid ? <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-center">
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white p-5"><img src={distributionUpcDataUrl} alt={`UPC barcode ${distributionUpc.formatted}`} className="mx-auto w-full max-w-[320px]" /></div>
          <div><p className="text-xs font-black uppercase tracking-[.12em] text-black/35">Distribution UPC</p><p className="mt-1 text-xl font-black tracking-[.08em]">{distributionUpc.formatted}</p><p className="mt-3 max-w-xl text-xs leading-5 text-black/45">Wine Hub creates standard UPC-A artwork from the distribution UPC for quick downloads and easy sales use.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void downloadImageAsFormat(distributionUpcDataUrl, 'png', distributionUpcFilename)} className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> PNG</button><button onClick={() => downloadTextFile(distributionUpcSvg, 'image/svg+xml;charset=utf-8', `${distributionUpcFilename}.svg`)} className="flex items-center gap-1.5 rounded-lg bg-[#326eac] px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> SVG</button><button onClick={() => void downloadImageAsFormat(distributionUpcDataUrl, 'jpeg', distributionUpcFilename)} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black"><Download className="h-3.5 w-3.5" /> JPEG</button></div></div>
        </div> : <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-black text-amber-900">UPC artwork could not be created.</p><p className="mt-1 text-xs leading-5 text-amber-800">{distributionUpc.reason}</p><p className="mt-2 font-mono text-xs text-amber-900">{distributionUpcSource}</p></div> : <div className="rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-5 py-8 text-center"><p className="text-sm font-bold text-black/45">No UPC is stored for this distribution item.</p></div>}
      </ProfileBlock>
    </div>

    <div className="mt-5">
      <ProfileBlock title="Wine Library Assets" badge={match ? 'Matched library record' : undefined}>
        {match ? <>
          <p className="mb-4 text-xs leading-5 text-black/45">This distribution product now points to the same approved assets used in the Wine Library.</p>
          <WineProfileAssets wine={match} />
        </> : <p className="text-sm text-black/40">No matching Wine Library record was found for this product yet.</p>}
      </ProfileBlock>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <ProfileBlock title="Imperial Measurements"><DistributionFacts rows={imperialRows} /></ProfileBlock>
      <ProfileBlock title="Metric Measurements"><DistributionFacts rows={metricRows} /></ProfileBlock>
    </div>
  </div>;
}

function DistributionFacts({ rows }: { rows: readonly (readonly [string, unknown])[] }) {
  return <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="min-w-0 border-b border-black/[.06] pb-3"><dt className="text-[10px] font-black uppercase tracking-[.12em] text-black/35">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{distributionValue(value)}</dd></div>)}</dl>;
}

function WineLibrary({ wines, allWines, categories, query, setQuery, category, setCategory, collection, setCollection, openWine, openTech, sync, allowTechSheets }: {
  wines: WineRecord[]; allWines: WineRecord[]; categories: string[]; query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; collection: WineCollectionName | null; setCollection: (value: WineCollectionName | null) => void; openWine: (wine: WineRecord) => void; openTech: (wine: WineRecord) => void; sync: SyncState; allowTechSheets: boolean;
}) {
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [batchColors, setBatchColors] = useState<Record<string, string>>({});
  const [preparingBatch, setPreparingBatch] = useState(false);
  const selectedWines = allWines.filter((wine) => selectedTechIds.includes(wine.id));
  const counts = useMemo(() => Object.fromEntries(WINE_COLLECTIONS.map((name) => [name, allWines.filter((wine) => collectionForWine(wine) === name).length])) as Record<WineCollectionName, number>, [allWines]);
  const categoryOptions = useMemo(() => collection ? ['All', ...Array.from(new Set(allWines.filter((wine) => collectionForWine(wine) === collection).map((wine) => wine.category))).sort()] : categories, [allWines, categories, collection]);
  const hasSearch = Boolean(query.trim());
  const showWines = Boolean(collection) || hasSearch;

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

  const chooseCollection = (value: WineCollectionName) => {
    setCollection(value);
    setQuery('');
    setCategory('All');
  };

  const backToCollections = () => {
    setCollection(null);
    setQuery('');
    setCategory('All');
  };

  return <>
    <div className="no-print mx-auto max-w-[1480px] p-5 md:p-8 xl:p-10">
      <PageHeader title="Wine Library" right={<div className="flex flex-wrap items-center justify-end gap-2">{allowTechSheets && <button onClick={() => setBatchMode((current) => !current)} className={`rounded-xl border px-4 py-2.5 text-xs font-black shadow-sm ${batchMode ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/65'}`}>{batchMode ? 'Done selecting' : 'Select tech sheets'}</button>}<Stat value={allWines.length} label="wines" /></div>} />

      <div className="mb-6">
        <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={collection ? `Search ${collection} wines…` : 'Search all wines…'} className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none focus:border-black/30" /></div>
      </div>

      {batchMode && <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#b9d7f3] bg-[#eef6fd] p-4 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm font-black">Batch tech sheets</p><p className="mt-1 text-xs leading-5 text-black/50">Open a collection, select the wines you need, then save them as one multi-page PDF. Notes, highlights, specs and awards are filled automatically.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm">{selectedWines.length} selected</span>
          {showWines && <button onClick={() => setSelectedTechIds(Array.from(new Set([...selectedTechIds, ...wines.map((wine) => wine.id)])))} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold">Select visible</button>}
          <button onClick={() => setSelectedTechIds([])} disabled={!selectedWines.length} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">Clear</button>
          <button onClick={() => void printBatch()} disabled={!selectedWines.length || preparingBatch} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-black text-white disabled:opacity-40">{preparingBatch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{preparingBatch ? 'Preparing…' : `Print / Save ${selectedWines.length || ''} sheets`}</button>
        </div>
      </div>}

      {!sync.configured && <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm"><Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><strong>Demo catalog is active.</strong> Connect the Commerce7 environment variables and the library will populate from your live Product catalog automatically. Any Wine Hub copy you edit is preserved when product facts sync.</div></div>}

      {!showWines ? <section>
        <h2 className="mb-4 text-2xl font-black tracking-[-.03em]">Collections</h2>
        <CollectionTiles counts={counts} onSelect={chooseCollection} noun="wine" />
      </section> : <>
        <div className="mb-5 flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div><button type="button" onClick={backToCollections} className="mb-2 flex items-center gap-1 text-[11px] font-black text-[#326eac]"><ChevronLeft className="h-3.5 w-3.5" /> Collections</button><h2 className="text-2xl font-black tracking-[-.03em]">{collection || 'Search Results'}</h2><p className="mt-1 text-xs font-semibold text-black/40">{wines.length} matching wine{wines.length === 1 ? '' : 's'}</p></div>
          <div className="flex max-w-[760px] gap-2 overflow-x-auto pb-1">{categoryOptions.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-xs font-bold ${category === item ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/60 hover:border-black/25'}`}>{item}</button>)}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {wines.map((wine) => <WineCard key={wine.id} wine={wine} open={() => openWine(wine)} tech={() => openTech(wine)} batchMode={allowTechSheets && batchMode} selected={selectedTechIds.includes(wine.id)} toggleSelected={() => toggleSelected(wine.id)} allowTechSheet={allowTechSheets} />)}
        </div>
        {!wines.length && <div className="rounded-2xl border border-dashed border-black/20 bg-white py-24 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-black/20" /><p className="font-bold">No wines match that search.</p></div>}
      </>}
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
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap gap-2"><span className="rounded-full bg-[#326eac] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-white shadow-sm">{collectionForWine(wine)}</span><span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] shadow-sm">{wine.category}</span>{wine.source === 'commerce7' && <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-white">C7</span>}</div>
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

function WineProfile({ wine, distributionWines, tab, setTab, editing, setEditing, save, saving, saveNotice, addAward, back, openTech, allowTechSheets }: {
  wine: WineRecord; distributionWines: DistributionWine[]; tab: ProfileTab; setTab: (tab: ProfileTab) => void; editing: WineRecord | null; setEditing: (wine: WineRecord | null) => void; save: () => void | Promise<void>; saving: boolean; saveNotice: string; addAward: () => void; back: () => void; openTech: () => void; allowTechSheets: boolean;
}) {
  const shown = editing ?? wine;
  const distributionItem = distributionItemForWine(shown, distributionWines);
  const gtin = distributionItem?.gtin || '—';
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
        <ProfileBlock title="At a glance"><dl className="grid grid-cols-2 gap-x-4 gap-y-4"><QuickFact label="Collection" value={collectionForWine(shown)} /><QuickFact label="Style" value={shown.category} /><QuickFact label="Sweetness" value={shown.sweetness || '—'} /><QuickFact label="ABV" value={shown.abv || '—'} /><QuickFact label="SRP" value={money(shown.price)} /><QuickFact label="Volume" value={shown.volumeMl ? `${shown.volumeMl} mL` : '—'} /><QuickFact label="UPC" value={shown.upc ? formatUpc(shown.upc) : '—'} /><QuickFact label="GTIN" value={gtin} /></dl></ProfileBlock>
        <ProfileBlock title="Awards" badge={`${shown.awards.length} total`}><div className="space-y-2">{shown.awards.map((award, index) => isEditing ? <AwardEditor key={award.id} award={award} onChange={(patch) => updateAward(index, patch)} onRemove={() => removeAward(index)} /> : <AwardRow key={award.id} award={award} />)}{!shown.awards.length && <p className="text-sm text-black/40">No awards added yet.</p>}{isEditing && <button onClick={addAward} className="mt-2 flex items-center gap-1.5 text-xs font-black text-[#326eac]"><Plus className="h-3.5 w-3.5" /> Add award</button>}</div></ProfileBlock>
      </div>
    </div>}

    {tab === 'sales' && <div className="grid gap-5 lg:grid-cols-2"><ProfileBlock title="Sales highlights">{isEditing ? <Textarea value={shown.highlights.join('\n')} onChange={(value) => update('highlights', safeArray(value))} rows={9} /> : <ul className="space-y-3">{shown.highlights.map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>}</ProfileBlock><ProfileBlock title="Production / vineyard notes">{isEditing ? <><label className="field-label">Production notes</label><Textarea value={shown.productionNotes || ''} onChange={(value) => update('productionNotes', value)} rows={5} /><label className="field-label mt-4">Vineyard notes</label><Textarea value={shown.vineyardNotes || ''} onChange={(value) => update('vineyardNotes', value)} rows={5} /></> : <div className="space-y-5"><div><p className="field-label">Production notes</p><p className="profile-copy">{shown.productionNotes || 'No production notes added.'}</p></div><div><p className="field-label">Vineyard notes</p><p className="profile-copy">{shown.vineyardNotes || 'No vineyard notes added.'}</p></div></div>}</ProfileBlock></div>}

    {tab === 'specs' && <div className="grid gap-5 lg:grid-cols-2"><ProfileBlock title="Commerce7 / product facts" badge={shown.source === 'commerce7' ? 'Managed in Commerce7' : 'Editable'}>{shown.source === 'commerce7' && isEditing && <p className="mb-4 rounded-xl bg-[#edf5fd] p-3 text-xs leading-5 text-[#285f96]">Product name, vintage, varietal, appellation, UPC, price and bottle size stay managed in Commerce7. Wine Hub-specific technical and sales fields remain editable here.</p>}<div className="grid gap-4 sm:grid-cols-2">{isEditing && shown.source !== 'commerce7' ? <><EditField label="Wine name" value={shown.name} onChange={(value) => update('name', value)} /><EditField label="Vintage" value={shown.vintage} onChange={(value) => update('vintage', value)} /><EditField label="Varietal" value={shown.varietal || ''} onChange={(value) => update('varietal', value)} /><EditField label="Appellation" value={shown.appellation || ''} onChange={(value) => update('appellation', value)} /><EditField label="UPC" value={shown.upc || ''} onChange={(value) => update('upc', value)} /><QuickFact label="GTIN" value={gtin} /><EditField label="SRP" value={shown.price === undefined ? '' : String(shown.price)} onChange={(value) => update('price', value ? Number(value) : undefined)} /><EditField label="Volume mL" value={shown.volumeMl === undefined ? '' : String(shown.volumeMl)} onChange={(value) => update('volumeMl', value ? Number(value) : undefined)} /></> : <><QuickFact label="Wine name" value={shown.name} /><QuickFact label="Vintage" value={shown.vintage} /><QuickFact label="Varietal" value={shown.varietal || '—'} /><QuickFact label="Appellation" value={shown.appellation || '—'} /><QuickFact label="UPC" value={shown.upc ? formatUpc(shown.upc) : '—'} /><QuickFact label="GTIN" value={gtin} /><QuickFact label="SRP" value={money(shown.price)} /><QuickFact label="Volume" value={shown.volumeMl ? `${shown.volumeMl} mL` : '—'} /></>}</div></ProfileBlock><ProfileBlock title="Tech data"><div className="grid gap-4 sm:grid-cols-2">{isEditing ? <><EditField label="ABV" value={shown.abv || ''} onChange={(value) => update('abv', value)} /><EditField label="Residual sugar" value={shown.rs || ''} onChange={(value) => update('rs', value)} /><EditField label="TA" value={shown.ta || ''} onChange={(value) => update('ta', value)} /><EditField label="pH" value={shown.ph || ''} onChange={(value) => update('ph', value)} /><EditField label="Case pack" value={shown.casePack || ''} onChange={(value) => update('casePack', value)} /><EditField label="Cases produced" value={shown.casesProduced || ''} onChange={(value) => update('casesProduced', value)} /><EditField label="Sweetness" value={shown.sweetness || ''} onChange={(value) => update('sweetness', value)} /></> : <><QuickFact label="ABV" value={shown.abv || '—'} /><QuickFact label="RS" value={shown.rs || '—'} /><QuickFact label="TA" value={shown.ta || '—'} /><QuickFact label="pH" value={shown.ph || '—'} /><QuickFact label="Case pack" value={shown.casePack || '—'} /><QuickFact label="Cases produced" value={shown.casesProduced || '—'} /><QuickFact label="Sweetness" value={shown.sweetness || '—'} /></>}</div></ProfileBlock></div>}

    {tab === 'assets' && <WineProfileAssets wine={shown} />}
  </div>;
}

function WineProfileAssets({ wine }: { wine: WineRecord }) {
  const images = wineImageAssets(wine);
  const lifestyleImages = lifestyleAssetsForWine(wine);
  const posDisplays = posDisplaysForWine(wine);
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
        const label = asset.label || (asset.role === 'front' ? 'Front bottle image' : asset.role === 'back' ? 'Back bottle image' : `Additional bottle image ${index + 1}`);
        const filename = assetFileBase(wine, asset.label ? asset.label.replace(/[^a-z0-9]+/gi, '-') : asset.role, index);
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

    <ProfileBlock title="POS Displays" badge={posDisplays.length ? `${posDisplays.length} display${posDisplays.length === 1 ? '' : 's'}` : undefined}>
      {posDisplays.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posDisplays.map((display, index) => {
        const filename = assetName(`${wine.name}${vintage}-POS-${display.label || index + 1}`);
        return <div key={display.id} className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <div className="flex h-72 items-center justify-center bg-[#f3f5f7] p-4"><img src={display.src} alt={`${wine.name} ${display.label}`} className="h-full w-full object-contain" /></div>
          <div className="p-4"><p className="text-sm font-black">{display.label}</p><p className="mt-1 min-h-8 text-[10px] leading-4 text-black/45">{display.description || 'Approved point-of-sale display artwork.'}</p><div className="mt-3 flex gap-2"><button onClick={() => void downloadImageAsFormat(display.src, 'png', filename)} className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[11px] font-black text-white"><Download className="h-3.5 w-3.5" /> PNG</button><button onClick={() => void downloadImageAsFormat(display.jpegSrc, 'jpeg', filename)} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black"><Download className="h-3.5 w-3.5" /> JPEG</button></div></div>
        </div>;
      })}</div> : <div className="rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-5 py-8 text-center"><Store className="mx-auto h-7 w-7 text-black/20" /><p className="mt-2 text-sm font-bold text-black/45">No POS displays are associated with this wine.</p><p className="mt-1 text-xs text-black/35">Approved case cards, floor displays and other merchandising assets will appear here when available.</p></div>}
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

    <ProfileBlock title="Links"><div className="space-y-3">{wine.productUrl && <a className="flex items-center gap-2 text-sm font-bold text-[#326eac]" href={wine.productUrl} target="_blank" rel="noreferrer">Open product page <ExternalLink className="h-4 w-4" /></a>}<p className="text-xs leading-5 text-black/45">Wine Hub reads the product photo gallery and UPC from Commerce7, adds approved case packaging and POS displays when available, and matches approved lifestyle photography to the wine by product name and brand.</p></div></ProfileBlock>
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
function AwardRow({ award, downloadable = false }: { award: Award; downloadable?: boolean }) {
  const graphic = award.graphicUrl || awardGraphicFor(award);
  const jpeg = graphic?.startsWith('/awards/') && /\.png$/i.test(graphic) ? graphic.replace(/\.png$/i, '.jpg') : undefined;
  return <div className="flex flex-col gap-3 rounded-xl bg-[#faf6ea] p-3 sm:flex-row sm:items-center">
    <div className="flex min-w-0 flex-1 items-center gap-3">{graphic ? <img src={graphic} alt="" className="h-12 w-12 shrink-0 object-contain" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d7a33d] text-white"><AwardIcon className="h-4 w-4" /></span>}<div><p className="text-sm font-black">{award.result}</p><p className="text-[11px] leading-4 text-black/55">{award.year} · {award.competition}</p></div></div>
    {downloadable && graphic && <div className="flex shrink-0 gap-2">
      <a href={graphic} download className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-black text-black/70 hover:bg-black/[.03]">PNG</a>
      {jpeg && <a href={jpeg} download className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-black text-black/70 hover:bg-black/[.03]">JPEG</a>}
    </div>}
  </div>;
}
function AwardEditor({ award, onChange, onRemove }: { award: Award; onChange: (patch: Partial<Award>) => void; onRemove: () => void }) { return <div className="rounded-xl border border-[#ead9b4] bg-[#fffaf0] p-3"><div className="grid gap-2 sm:grid-cols-[90px_1fr]"><label><span className="field-label">Year</span><input type="number" value={award.year} onChange={(event) => onChange({ year: Number(event.target.value) || new Date().getFullYear() })} className="field-input" /></label><EditField label="Result" value={award.result} onChange={(value) => onChange({ result: value })} /></div><div className="mt-2"><EditField label="Competition" value={award.competition} onChange={(value) => onChange({ competition: value })} /></div><div className="mt-2"><EditField label="Award graphic URL (optional)" value={award.graphicUrl || ''} onChange={(value) => onChange({ graphicUrl: value || undefined })} /></div><button onClick={onRemove} className="mt-3 text-[11px] font-black text-red-600 hover:text-red-700">Remove award</button></div>; }


function QuickFactsView() {
  const downloadButton = 'flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black shadow-sm hover:bg-black/[.03]';
  return <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">
    <PageHeader
      title="Leelanau Cellars Quick Facts"
      right={<div className="flex flex-wrap gap-2">
        <a href="/tasting-room/quick-facts.pdf" download="Leelanau Cellars Quick Facts for Tasting Room Staff.pdf" className={downloadButton}><Download className="h-4 w-4" /> Download PDF</a>
        <a href="/tasting-room/quick-facts.docx" download="Leelanau Cellars Quick Facts for Tasting Room Staff.docx" className={downloadButton}><Download className="h-4 w-4" /> Download Word</a>
      </div>}
    />

    <div className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-7">
        <h2 className="text-2xl font-black">{QUICK_FACTS.story.title}</h2>
        <ul className="mt-5 space-y-3.5 text-[15px] leading-7 text-black/75">{QUICK_FACTS.story.bullets.map((item) => <li key={item} className="flex gap-3"><span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" /><span>{item}</span></li>)}</ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{QUICK_FACTS.story.brands.map(([brand, detail]) => <div key={brand} className="rounded-xl bg-[#f6f7f8] p-4"><p className="text-[15px] font-black">{brand}</p><p className="mt-1.5 text-[13px] leading-5 text-black/68">{detail}</p></div>)}</div>
      </section>

      <div className="grid gap-5">
        {[QUICK_FACTS.region, QUICK_FACTS.growing].map((section) => <section key={section.title} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-7"><h2 className="text-2xl font-black">{section.title}</h2><ul className="mt-4 space-y-3 text-[15px] leading-7 text-black/72">{section.bullets.map((item) => <li key={item} className="flex gap-3"><span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BA3F8]" /><span>{item}</span></li>)}</ul></section>)}
      </div>
    </div>

    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-7">
      <h2 className="text-2xl font-black">Our Vineyard Sites</h2>
      <div className="mt-3 rounded-xl bg-[#f2f7fc] px-4 py-3 text-[15px] leading-6 text-black/75"><strong className="text-[#326eac]">Leelanau Cellars has 68.5 total vineyard acres.</strong> A vineyard is defined as a set of vines distinct from others by planting time, variety/rootstock, or location within a site.</div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-[15px]"><thead><tr className="border-b border-black/10 text-[11px] font-black uppercase tracking-[.12em] text-black/60"><th className="pb-3 pr-4">Site</th><th className="pb-3 pr-4">Key Features</th><th className="pb-3">Vineyards</th></tr></thead><tbody>{QUICK_FACTS.vineyards.map((item) => <tr key={item.site} className="border-b border-black/[.06] last:border-0"><td className="py-3.5 pr-4 font-black">{item.site}</td><td className="py-3.5 pr-4 text-black/70">{item.features}</td><td className="py-3.5 font-bold">{item.vineyards}</td></tr>)}</tbody></table></div>
    </section>

    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-7">
      <h2 className="text-2xl font-black">Grape Varieties Grown</h2>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[13px]"><thead><tr className="border-b border-black/10 text-[10px] font-black uppercase tracking-[.12em] text-black/60"><th className="pb-3 pr-4">Variety</th><th className="pb-3 pr-4">Type</th><th className="pb-3 pr-4">Acreage</th><th className="pb-3 pr-4">Location(s)</th><th className="pb-3">Notes</th></tr></thead><tbody>{QUICK_FACTS.varieties.map((item) => <tr key={item.variety} className="border-b border-black/[.06] align-top last:border-0"><td className="py-3.5 pr-4 text-[14px] font-black">{item.variety}</td><td className="py-3.5 pr-4 text-black/68">{item.type}</td><td className="py-3.5 pr-4 font-bold">{item.acreage}</td><td className="py-3.5 pr-4 text-black/68">{item.locations}</td><td className="py-3.5 text-black/68">{item.notes}</td></tr>)}</tbody></table></div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3"><FactMini title="Hilltop white hybrid trial" text={QUICK_FACTS.trials.white} /><FactMini title="Hilltop red hybrid trial" text={QUICK_FACTS.trials.red} /><FactMini title="Coming Soon" text={QUICK_FACTS.trials.comingSoon} /></div>
    </section>

    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-7"><h2 className="text-2xl font-black">Vintage Vineyard Summaries</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{QUICK_FACTS.vintages.map((vintage) => <div key={vintage.year} className="rounded-xl bg-[#f6f7f8] p-4"><p className="text-xl font-black">{vintage.year}</p><ul className="mt-2.5 space-y-2 text-[13px] leading-5 text-black/68">{vintage.bullets.map((item) => <li key={item}>• {item}</li>)}</ul></div>)}</div></section>
  </div>;
}

function FactMini({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-black/[.07] bg-[#fafafa] p-4"><p className="text-sm font-black">{title}</p><p className="mt-1.5 text-[13px] leading-5 text-black/65">{text}</p></div>;
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
  const [notesView, setNotesView] = useState<'web' | 'print'>('web');
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
      setMenuUploadNotice('Current menu PDF updated. Update the tasting menu list below if the wines changed.');
      await loadMenuInfo();
    } catch (error) {
      setMenuUploadNotice(error instanceof Error ? error.message : 'Unable to replace the current menu.');
    } finally {
      setMenuUploading(false);
    }
  }

  const printStaffNotes = () => {
    const style = document.createElement('style');
    style.media = 'print';
    style.textContent = '@page { size: letter landscape; margin: 0; }';
    document.head.appendChild(style);
    const cleanup = () => {
      style.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    printWithTitle(`Leelanau Cellars - Tasting Menu and Notes - ${new Date().toISOString().slice(0, 10)}`);
  };

  useEffect(() => { void loadMenuInfo(); }, []);

  const rawMenuDate = menuInfo?.updatedAt || `${CURRENT_TASTING_MENU_VERSION}T12:00:00`;
  const menuDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(rawMenuDate));

  return <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">
    <div className="no-print"><PageHeader title="Tasting Menu and Notes" right={<button onClick={printStaffNotes} className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white"><Printer className="h-4 w-4" /> Print / Save PDF</button>} /></div>

    <section className="no-print mb-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="text-xl font-black">Current Tasting Room Menu</h2><p className="mt-1.5 text-sm font-semibold text-black/55">{menuLoading ? 'Loading menu…' : `As of ${menuDate}`}</p></div>
        <div className="flex flex-wrap gap-2">
          <a href={menuInfo?.viewUrl || '/api/tasting-room/menu?inline=1'} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black"><ExternalLink className="h-4 w-4" /> View PDF</a>
          <a href={menuInfo?.downloadUrl || '/api/tasting-room/menu?download=1'} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black"><Download className="h-4 w-4" /> Download PDF</a>
          <button onClick={useOfficialMenu} className="flex items-center gap-2 rounded-xl bg-[#326eac] px-4 py-3 text-xs font-black text-white"><ClipboardList className="h-4 w-4" /> Use current menu</button>
          {role === 'admin' && <label className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black ${menuInfo?.storageConfigured ? 'cursor-pointer bg-black text-white' : 'cursor-not-allowed bg-black/10 text-black/35'}`}><Upload className="h-4 w-4" /> {menuUploading ? 'Uploading…' : 'Replace Menu'}<input type="file" accept="application/pdf,.pdf" disabled={!menuInfo?.storageConfigured || menuUploading} className="hidden" onChange={(event) => { void replaceOfficialMenu(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>}
        </div>
      </div>
      {role === 'admin' && menuInfo && !menuInfo.storageConfigured && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900"><strong>The current menu is already bundled and downloadable.</strong> To replace the PDF from inside Central later, connect Vercel Blob to the project.</p>}
      {menuUploadNotice && <p className="mt-3 rounded-xl bg-[#f6f7f8] px-3 py-2.5 text-[11px] font-bold leading-5 text-black/60">{menuUploadNotice}</p>}

      <details className="mt-5 border-t border-black/10 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4"><div><p className="text-sm font-black">Manage tasting menu list</p><p className="mt-1 text-xs text-black/50">{selected.length} wines selected</p></div><span className="rounded-lg bg-[#edf5fd] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#326eac]">Open controls</span></summary>
        <div className="pt-5">
          <div className={`mb-4 rounded-xl p-3 text-xs leading-5 ${commerce7Connected ? 'bg-emerald-50 text-emerald-800' : 'bg-[#edf5fd] text-[#285f96]'}`}><strong>{commerce7Connected ? 'Shared tasting menu list enabled.' : 'Local tasting menu list.'}</strong> {commerce7Connected ? 'Save the selection so the current list follows the team.' : 'The wine selection is saved in this browser until Commerce7 is connected.'}</div>
          <div className="flex flex-wrap gap-2">{chosen.slice(0, 16).map((wine) => <button key={wine.id} onClick={() => toggle(wine.id)} className="rounded-full bg-[#eef5fb] px-3 py-1.5 text-[11px] font-bold text-black/65">{wine.name}{wine.vintage && wine.vintage !== 'NV' ? ` ${wine.vintage}` : ''} ×</button>)}{chosen.length > 16 && <span className="rounded-full bg-black/[.05] px-3 py-1.5 text-[11px] font-bold text-black/45">+{chosen.length - 16} more</span>}</div>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => { setShowImport(!showImport); setShowPicker(false); }} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-black"><FileText className="h-4 w-4" /> Match menu text</button><button onClick={() => { setShowPicker(!showPicker); setShowImport(false); }} className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-black text-white"><Plus className="h-4 w-4" /> Add / change wines</button><button onClick={() => void saveMenu()} disabled={savingMenu} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-black disabled:opacity-50">{savingMenu ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {savingMenu ? 'Saving…' : 'Save selection'}</button>{selected.length > 0 && <button onClick={() => setSelected([])} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-bold text-black/55">Clear list</button>}</div>
          {showImport && <div className="mt-4 rounded-xl border border-black/10 bg-[#fafafa] p-4"><p className="text-xs font-black">Auto-select from menu text</p><p className="mt-1 text-[11px] leading-4 text-black/50">Paste a wine list or upload a text-based menu. Central matches names against the Commerce7 catalog.</p><textarea value={menuText} onChange={(event) => setMenuText(event.target.value)} rows={7} placeholder="Paste a tasting-room wine list here…" className="field-input mt-3 resize-y text-xs leading-5" /><div className="mt-2 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-black">Upload text file<input type="file" accept=".txt,.csv,.md,.html,text/plain,text/csv,text/html" className="hidden" onChange={(event) => void readMenuFile(event.target.files?.[0])} /></label><button onClick={() => autoSelect()} className="rounded-lg bg-[#326eac] px-3 py-2 text-[11px] font-black text-white">Match wines</button></div>{importNotice && <p className="mt-2 text-[10px] leading-4 text-black/50">{importNotice}</p>}</div>}
          {showPicker && <div className="mt-4"><div className="relative mb-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search the wine library…" className="field-input pl-9" /></div><div className="grid max-h-[480px] gap-2 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">{available.map((wine) => <label key={wine.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${selected.includes(wine.id) ? 'border-[#b9d7f3] bg-[#eaf3fb]' : 'border-black/8 hover:bg-black/[.025]'}`}><input type="checkbox" checked={selected.includes(wine.id)} onChange={() => toggle(wine.id)} className="h-4 w-4 accent-black" /><div className="min-w-0"><p className="truncate text-sm font-bold">{wine.name}</p><p className="text-[11px] text-black/45">{wine.vintage} · {wine.category}</p></div></label>)}</div></div>}
        </div>
      </details>
    </section>

    <div className="no-print mb-5 flex gap-2">
      <button onClick={() => setNotesView('web')} className={`rounded-xl border px-4 py-2.5 text-xs font-black transition ${notesView === 'web' ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/65'}`}>Web View</button>
      <button onClick={() => setNotesView('print')} className={`rounded-xl border px-4 py-2.5 text-xs font-black transition ${notesView === 'print' ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/65'}`}>Print Preview</button>
    </div>

    <div className="no-print">{notesView === 'web' ? <StaffNotesWeb chosen={chosen} openWine={openWine} /> : <TastingGuide chosen={chosen} openWine={openWine} />}</div>
    <div className="print-root hidden print:block"><TastingGuide chosen={chosen} /></div>
  </div>;

}

function staffGuideAccent(category: string) {
  const accents: Record<string, string> = {
    Red: '#7b2f43',
    White: '#a57b18',
    'Rosé': '#b85d73',
    Sparkling: '#66798d',
    'Fruit & Sweet': '#825777',
    Dessert: '#6c4d3d',
    'Seasonal / Specialty': '#b65f35',
    Other: '#4e6c73',
  };
  return accents[category] || accents.Other;
}

function staffGuideCopy(value = '') {
  return value.replace(/\s*\n\s*/g, ' · ').replace(/\s+/g, ' ').trim();
}

function StaffNotesWeb({ chosen, openWine }: { chosen: WineRecord[]; openWine: (wine: WineRecord) => void }) {
  const [guideQuery, setGuideQuery] = useState('');
  const [guideCategory, setGuideCategory] = useState('All');
  const sorted = [...chosen].sort((a, b) => {
    const aCategory = guideCategoryFor(a);
    const bCategory = guideCategoryFor(b);
    const ai = GUIDE_CATEGORY_ORDER.indexOf(aCategory);
    const bi = GUIDE_CATEGORY_ORDER.indexOf(bCategory);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.name.localeCompare(b.name);
  });
  const categories = ['All', ...GUIDE_CATEGORY_ORDER.filter((category) => sorted.some((wine) => guideCategoryFor(wine) === category))];
  const needle = guideQuery.trim().toLowerCase();
  const filtered = sorted.filter((wine) => {
    const reference = staffReferenceForWine(wine);
    const flavor = staffGuideCopy(staffFlavorProfile(wine, reference));
    const context = vintageViticultureForWine(wine, reference);
    const haystack = `${wine.name} ${wine.vintage || ''} ${guideCategoryFor(wine)} ${wine.varietal || ''} ${flavor} ${context}`.toLowerCase();
    return (guideCategory === 'All' || guideCategoryFor(wine) === guideCategory) && (!needle || haystack.includes(needle));
  });
  const groups = GUIDE_CATEGORY_ORDER.map((category) => ({ category, wines: filtered.filter((wine) => guideCategoryFor(wine) === category) })).filter((group) => group.wines.length);

  if (!chosen.length) return <div className="rounded-2xl border border-dashed border-black/15 bg-white py-24 text-center"><ClipboardList className="mx-auto h-8 w-8 text-black/20" /><p className="mt-3 font-black">No wines are in Tasting Menu and Notes yet.</p><p className="mt-1 text-sm text-black/40">Use the current tasting-room menu to populate the list.</p></div>;

  return <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
    <div className="wine-report-toolbar flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">{categories.map((category) => <button key={category} onClick={() => setGuideCategory(category)} className={`whitespace-nowrap rounded-lg border px-3 py-2 text-[11px] font-black transition ${guideCategory === category ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/55 hover:bg-black/[.03]'}`}>{category}</button>)}</div>
      <div className="relative w-full lg:w-[300px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/25" /><input value={guideQuery} onChange={(event) => setGuideQuery(event.target.value)} placeholder="Search wines or flavors…" className="field-input h-10 pl-9 text-xs" /></div>
    </div>

    <div className="wine-report-head hidden grid-cols-[1.05fr_1.25fr_1.9fr_1.55fr_.48fr] bg-[#f4f3f1] px-6 py-3 text-[9px] font-black uppercase tracking-[.12em] text-black/42 lg:grid"><div>Wine</div><div>Specs</div><div>Flavor &amp; Style</div><div>Vintage / Vineyard</div><div className="text-right">Price</div></div>
    <div className="px-4 pb-5 lg:px-6">
      {!groups.length ? <div className="py-16 text-center text-sm font-semibold text-black/40">No wines match that search.</div> : groups.map(({ category, wines }) => {
        const accent = staffGuideAccent(category);
        return <div key={category} className="wine-report-section pt-4">
          <div className="rounded-sm px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white" style={{ backgroundColor: accent }}>{category}</div>
          {wines.map((wine) => {
            const reference = staffReferenceForWine(wine);
            const flavor = staffGuideCopy(staffFlavorProfile(wine, reference));
            const vintageContext = vintageViticultureForWine(wine, reference);
            const style = staffStyleLabel(wine, reference);
            const abv = wine.abv || (reference?.abv ? `${reference.abv}%` : '');
            const composition = reference?.composition || wine.varietal || '';
            const specs = [style, abv ? `${abv.includes('%') ? abv : `${abv}%`} ABV` : '', reference?.aging ? `${reference.aging} aged` : '', reference?.casesProduced && Number(reference.casesProduced) <= 250 ? `${reference.casesProduced} cases` : ''].filter(Boolean);
            return <article key={wine.id} className="wine-report-row grid gap-3 border-b border-black/10 py-4 last:border-b-0 lg:grid-cols-[1.05fr_1.25fr_1.9fr_1.55fr_.48fr] lg:gap-0 lg:py-3.5">
              <div className="lg:pr-5"><button onClick={() => openWine(wine)} className="text-left text-[15px] font-black leading-5 tracking-[-.015em] hover:text-[#326eac]">{wine.name}</button>{wine.vintage && wine.vintage !== 'NV' && <span className="mt-0.5 block text-[11px] font-semibold text-black/38">{wine.vintage}</span>}</div>
              <div className="text-[12px] leading-[1.5] text-black/62 lg:pr-5"><span className="wine-report-mobile-label">Specs</span>{specs.join(' · ') || 'Wine'}{composition && <span className="mt-1 block text-[10px] leading-4 text-black/42">{composition}</span>}</div>
              <div className="text-[13px] leading-[1.5] text-black/72 lg:pr-6"><span className="wine-report-mobile-label">Flavor &amp; Style</span>{flavor || 'Use the Commerce7 flavor profile and style for this wine.'}</div>
              <div className="text-[12px] leading-[1.5] text-black/52 lg:pr-5"><span className="wine-report-mobile-label">Vintage / Vineyard</span>{vintageContext || '—'}</div>
              <div className="text-[14px] font-black lg:text-right"><span className="wine-report-mobile-label">Price</span>{money(wine.price)}</div>
            </article>;
          })}
        </div>;
      })}
    </div>
  </section>;
}

function TastingGuide({ chosen, openWine }: { chosen: WineRecord[]; openWine?: (wine: WineRecord) => void }) {
  const categoryRank = (wine: WineRecord) => {
    const category = guideCategoryFor(wine);
    const index = GUIDE_CATEGORY_ORDER.indexOf(category);
    return index === -1 ? GUIDE_CATEGORY_ORDER.length : index;
  };
  const sorted = [...chosen].sort((a, b) => categoryRank(a) - categoryRank(b) || a.name.localeCompare(b.name));
  const pageSize = 8;
  const pages = sorted.length ? Array.from({ length: Math.ceil(sorted.length / pageSize) }, (_, index) => sorted.slice(index * pageSize, (index + 1) * pageSize)) : [[]];
  const today = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  const renderWine = (wine: WineRecord) => {
    const reference = staffReferenceForWine(wine);
    const category = guideCategoryFor(wine);
    const accent = staffGuideAccent(category);
    const flavor = staffGuideCopy(staffFlavorProfile(wine, reference));
    const vintageContext = vintageViticultureForWine(wine, reference);
    const style = staffStyleLabel(wine, reference);
    const abv = wine.abv || (reference?.abv ? `${reference.abv}%` : '');
    const composition = reference?.composition || wine.varietal || '';
    const specs = [style, abv ? `${abv.includes('%') ? abv : `${abv}%`} ABV` : '', reference?.aging ? `${reference.aging} aged` : '', reference?.casesProduced && Number(reference.casesProduced) <= 250 ? `${reference.casesProduced} cases` : ''].filter(Boolean);

    return <article key={wine.id} className="staff-report-row relative grid min-h-0 grid-cols-[1.02fr_1.25fr_1.9fr_1.5fr_.48fr] items-start border-b border-black/10 bg-white">
      <span className="absolute bottom-0 left-0 top-0 w-[4px]" style={{ backgroundColor: accent }} />
      <div className="staff-report-cell pl-4"><span className="staff-report-category" style={{ color: accent }}>{category}</span><p className="staff-report-name">{wine.name}</p>{wine.vintage && wine.vintage !== 'NV' && <p className="staff-report-vintage">{wine.vintage}</p>}{openWine && <button onClick={() => openWine(wine)} className="no-print mt-1 text-[9px] font-black text-[#326eac]">Open wine profile →</button>}</div>
      <div className="staff-report-cell staff-report-specs"><p>{specs.join(' · ') || 'Wine'}</p>{composition && <p className="staff-report-blend">{composition}</p>}</div>
      <div className="staff-report-cell staff-report-flavor">{flavor || 'Use the Commerce7 flavor profile and style for this wine.'}</div>
      <div className="staff-report-cell staff-report-context">{vintageContext || '—'}</div>
      <div className="staff-report-cell staff-report-price">{money(wine.price)}</div>
    </article>;
  };

  return <div className="staff-report-pages space-y-5 print:space-y-0">
    {pages.map((pageWines, pageIndex) => <section key={`staff-report-page-${pageIndex}`} className="staff-report-page overflow-hidden bg-white shadow-xl print:shadow-none">
      <header className="staff-report-header flex items-center justify-between border-b border-black/10 bg-white px-7 py-4">
        <div className="flex items-center gap-3"><img src="/lwc-logo.png" alt="" className="h-10 w-10 border border-black bg-white object-cover" /><div><p className="text-[7px] font-black uppercase tracking-[.23em] text-[#3976b7]">Leelanau Cellars · Tasting Room</p><h2 className="mt-0.5 text-[22px] font-black tracking-[-.035em]">Tasting Menu and Notes</h2><p className="mt-0.5 text-[7.5px] font-semibold text-black/40">Current wines · tasting-room profiles · concise vintage context</p></div></div>
        <div className="text-right"><p className="text-[8px] font-black text-black/65">{today}</p><p className="mt-1 text-[7px] font-semibold text-black/35">{chosen.length} wines · {pageIndex + 1} / {pages.length}</p></div>
      </header>
      <div className="staff-report-columns grid grid-cols-[1.02fr_1.25fr_1.9fr_1.5fr_.48fr] bg-[#f3f2f0] px-0 text-[7px] font-black uppercase tracking-[.12em] text-black/45"><div className="pl-4">Wine</div><div>Specs</div><div>Flavor &amp; Style</div><div>Vintage / Vineyard</div><div className="pr-3 text-right">Price</div></div>
      {!pageWines.length ? <div className="flex min-h-[620px] items-center justify-center p-10 text-center text-sm text-black/40">The current tasting-room menu will populate Tasting Menu and Notes here.</div> : <div className="staff-report-grid">{pageWines.map(renderWine)}{Array.from({ length: Math.max(0, pageSize - pageWines.length) }).map((_, index) => <div key={`empty-${index}`} className="staff-report-empty border-b border-black/10 bg-white" />)}</div>}
      <footer className="staff-report-footer flex items-center justify-between border-t border-black/10 bg-[#f5f5f4] px-7 text-[7px] font-semibold text-black/38"><span>Internal tasting-room reference · write personal notes in the margins as needed.</span><span>lwc.wine · 231-386-5201</span></footer>
    </section>)}
  </div>;
}

function TechSheetLibrary({ wines, openTech }: { wines: WineRecord[]; openTech: (wine: WineRecord) => void }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [collection, setCollection] = useState<WineCollectionName | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchColors, setBatchColors] = useState<Record<string, string>>({});
  const [preparingBatch, setPreparingBatch] = useState(false);
  const counts = useMemo(() => Object.fromEntries(WINE_COLLECTIONS.map((name) => [name, wines.filter((wine) => collectionForWine(wine) === name).length])) as Record<WineCollectionName, number>, [wines]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(wines.filter((wine) => !collection || collectionForWine(wine) === collection).map((wine) => wine.category))).sort()], [wines, collection]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return wines.filter((wine) => (!collection || collectionForWine(wine) === collection) && (category === 'All' || wine.category === category) && (!needle || `${wine.name} ${wine.vintage} ${wine.varietal || ''} ${wine.category} ${wine.brand} ${wine.vendor || ''}`.toLowerCase().includes(needle)));
  }, [wines, q, category, collection]);
  const selectedWines = wines.filter((wine) => selectedIds.includes(wine.id));
  const showWines = Boolean(collection) || Boolean(q.trim());
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const chooseCollection = (value: WineCollectionName) => { setCollection(value); setQ(''); setCategory('All'); };
  const backToCollections = () => { setCollection(null); setQ(''); setCategory('All'); };
  const printBatch = async () => {
    if (!selectedWines.length || preparingBatch) return;
    setPreparingBatch(true);
    const entries = await Promise.all(selectedWines.map(async (wine) => [wine.id, wine.bottleImage ? await prominentLabelColor(wine.bottleImage) || TECH_COLOR : TECH_COLOR] as const));
    setBatchColors(Object.fromEntries(entries));
    setPreparingBatch(false);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => printWithTitle(`Leelanau Cellars - ${selectedWines.length} Tech Sheets`)));
  };

  return <>
    <div className="no-print mx-auto max-w-[1480px] p-5 md:p-8 xl:p-10">
      <PageHeader title="Tech Sheets" right={<div className="flex flex-wrap items-center gap-2"><button onClick={() => setBatchMode((current) => !current)} className={`rounded-xl border px-4 py-2.5 text-xs font-black shadow-sm ${batchMode ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/65'}`}>{batchMode ? 'Done selecting' : 'Select multiple'}</button><Stat value={wines.length} label="wines" /></div>} />
      <div className="mb-6"><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder={collection ? `Search ${collection} wines…` : 'Search all wines…'} className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none focus:border-black/30" /></div></div>

      {batchMode && <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#b9d7f3] bg-[#eef6fd] p-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-black">Batch tech sheets</p><p className="mt-1 text-xs leading-5 text-black/55">Select the wines you need, then save the group as one multi-page PDF.</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm">{selectedWines.length} selected</span>{showWines && <button onClick={() => setSelectedIds(Array.from(new Set([...selectedIds, ...filtered.map((wine) => wine.id)])))} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold">Select visible</button>}<button onClick={() => setSelectedIds([])} disabled={!selectedWines.length} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">Clear</button><button onClick={() => void printBatch()} disabled={!selectedWines.length || preparingBatch} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-black text-white disabled:opacity-40">{preparingBatch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{preparingBatch ? 'Preparing…' : `Print / Save ${selectedWines.length || ''} sheets`}</button></div></div>}

      {!showWines ? <section><h2 className="mb-4 text-2xl font-black tracking-[-.03em]">Collections</h2><CollectionTiles counts={counts} onSelect={chooseCollection} noun="wine" /></section> : <>
        <div className="mb-5 flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div><button type="button" onClick={backToCollections} className="mb-2 flex items-center gap-1 text-[11px] font-black text-[#326eac]"><ChevronLeft className="h-3.5 w-3.5" /> Collections</button><h2 className="text-2xl font-black tracking-[-.03em]">{collection || 'Search Results'}</h2><p className="mt-1 text-xs font-semibold text-black/45">{filtered.length} matching wine{filtered.length === 1 ? '' : 's'}</p></div>
          <div className="flex max-w-[760px] gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-xs font-bold ${category === item ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/60 hover:border-black/25'}`}>{item}</button>)}</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filtered.map((wine) => { const selected = selectedIds.includes(wine.id); const award = wine.awards[0]; return <article key={wine.id} className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${selected ? 'border-[#3976b7] ring-2 ring-[#3976b7]/15' : 'border-black/10'}`}><button onClick={() => batchMode ? toggle(wine.id) : openTech(wine)} className="block w-full text-left"><div className="relative h-56 overflow-hidden bg-[#eef2f6]">{wine.bottleImage ? <img src={wine.bottleImage} alt="" className="h-full w-full object-contain object-center p-3 transition duration-300 group-hover:scale-[1.02]" /> : <WinePlaceholder wine={wine} />}<span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] shadow-sm">{wine.category}</span>{award && <span className="absolute bottom-3 left-3 rounded-full bg-[#d7a33d] px-2.5 py-1 text-[10px] font-black uppercase text-white">{award.result} · {award.year}</span>}{batchMode && <span className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 ${selected ? 'border-[#3976b7] bg-[#3976b7] text-white' : 'border-white bg-white/90 text-black/20'}`}>{selected ? <Check className="h-4 w-4" /> : null}</span>}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black leading-5">{wine.name}</h2><p className="mt-1 text-xs font-semibold text-black/50">{wine.vintage} · {wine.varietal || wine.category}</p></div><span className="text-sm font-black">{money(wine.price)}</span></div><p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-black/60">{shortCommerce7TastingNotes(wine) || wine.shortDescription || wine.tastingNotes || 'Open the tech sheet to customize this wine.'}</p><p className="mt-3 text-[11px] font-black text-[#326eac]">{batchMode ? (selected ? 'Selected for PDF' : 'Click to select') : 'Open tech sheet →'}</p></div></button></article>; })}</div>
        {!filtered.length && <div className="rounded-2xl border border-dashed border-black/20 bg-white py-24 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-black/20" /><p className="font-bold">No wines match that search.</p></div>}
      </>}
    </div>
    {batchMode && selectedWines.length > 0 && <div className="batch-tech-print print-root hidden print:block">{selectedWines.map((wine) => { const batchDraft = { ...draftFromWine(wine), headerColor: batchColors[wine.id] || TECH_COLOR }; return <div key={`tech-library-batch-${wine.id}`} className="batch-tech-page"><TechSheetPaper draft={batchDraft} wine={wine} /></div>; })}</div>}
  </>;
}

function TechSheetBuilder({ wines, activeWine, activeWineId, setActiveWineId, draft, setDraft, back }: {
  wines: WineRecord[];
  activeWine?: WineRecord;
  activeWineId: string;
  setActiveWineId: (id: string) => void;
  draft: TechSheetDraft;
  setDraft: React.Dispatch<React.SetStateAction<TechSheetDraft>>;
  back: () => void;
}) {
  const [colorStatus, setColorStatus] = useState('');
  const update = <K extends keyof TechSheetDraft>(key: K, value: TechSheetDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const automaticCasePackaging = casePackagingForWine(activeWine);
  const availablePosDisplays = posDisplaysForWine(activeWine);
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
      <div className="flex items-center gap-3"><button onClick={back} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-black text-black/60"><ChevronLeft className="h-3.5 w-3.5" /> Tech Sheets</button><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3976b7]">Tech sheet builder</p><p className="text-sm font-black">Document overrides never change Commerce7</p></div></div>
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
            <p className="text-xs font-black">Display / POS</p>
            <p className="mt-1 text-[10px] leading-4 text-black/45">Optional. Add a display, floor stack, case card, endcap, or other merchandising image for this tech sheet. If approved POS artwork is available for this wine, choose it below. If Case Packaging is included, Display appears beside it; otherwise Display slides into that space by itself.</p>
            {availablePosDisplays.length > 0 && <div className="mt-3">
              <p className="field-label">Approved POS displays</p>
              <div className="mt-2 grid grid-cols-2 gap-2">{availablePosDisplays.map((display) => <button key={display.id} type="button" onClick={() => update('displayImage', display.src)} className={`overflow-hidden rounded-lg border bg-white text-left transition ${draft.displayImage === display.src ? 'border-black ring-1 ring-black' : 'border-black/10 hover:border-black/30'}`}>
                <div className="flex h-24 items-center justify-center bg-[#f3f5f7] p-2"><img src={display.src} alt="" className="h-full w-full object-contain" /></div>
                <div className="px-2.5 py-2 text-[10px] font-black leading-4">{display.label}</div>
              </button>)}</div>
            </div>}
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
  const withAwards = wines.filter((wine) => wine.awards.length).sort((a, b) => a.name.localeCompare(b.name));
  const total = withAwards.reduce((sum, wine) => sum + wine.awards.length, 0);
  return <div className="no-print mx-auto max-w-[1320px] p-5 md:p-8 xl:p-10">
    <PageHeader title="Awards Library" right={<Stat value={total} label="awards" />} />
    <div className="grid gap-4 lg:grid-cols-2">{withAwards.map((wine) => <article key={wine.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md">
      <button type="button" onClick={() => openWine(wine)} className="mb-4 block w-full text-left"><h2 className="text-xl font-black">{wine.name} <span className="font-semibold text-black/35">{wine.vintage === 'NV' ? '' : wine.vintage}</span></h2></button>
      <div className="space-y-2">{wine.awards.map((award) => <AwardRow key={award.id} award={award} downloadable />)}</div>
    </article>)}</div>
  </div>;
}

function AssetsView({ wines, openWine }: { wines: WineRecord[]; openWine: (wine: WineRecord) => void }) {
  const assets = wines.filter((wine) => wineImageAssets(wine).length || lifestyleAssetsForWine(wine).length || posDisplaysForWine(wine).length || casePackagingForWine(wine) || wine.upc);
  return <div className="no-print mx-auto max-w-[1320px] p-5 md:p-8 xl:p-10">
    <PageHeader eyebrow="Approved creative" title="Asset Library" description="Bottle photography, lifestyle images, POS displays, approved case packaging and downloadable UPC barcode artwork for each wine." />
    <section className="mb-7 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"><div className="flex items-center gap-4"><img src="/lwc-logo.png" alt="" className="h-20 w-20 border border-black" /><div><p className="text-sm font-black">Leelanau Cellars square logo</p><p className="mt-1 text-xs text-black/45">Used automatically on the sales tech-sheet template.</p></div></div></section>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{assets.map((wine) => {
      const images = wineImageAssets(wine);
      const lifestyle = lifestyleAssetsForWine(wine);
      const posDisplays = posDisplaysForWine(wine);
      const packaging = casePackagingForWine(wine);
      const upc = normalizeUpcA(wine.upc || '');
      const preview = images[0]?.src || lifestyle[0]?.src || posDisplays[0]?.src || packaging?.src;
      const extras = [posDisplays.length ? `${posDisplays.length} POS` : '', packaging ? 'case' : '', upc.valid ? 'UPC' : ''].filter(Boolean).join(' · ');
      return <div key={wine.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <button onClick={() => openWine(wine)} className="block w-full text-left"><div className="flex h-52 items-center justify-center bg-[#f2f4f6]">{preview && <img src={preview} alt="" className="h-full w-full object-contain p-4" />}</div><div className="p-4"><p className="font-black">{wine.name}</p><p className="mt-1 text-xs text-black/40">{wine.vintage} · {images.length} bottle · {lifestyle.length} lifestyle{extras ? ` · ${extras}` : ''}</p></div></button>
        <div className="flex border-t border-black/10 p-2"><button onClick={() => openWine(wine)} className="flex-1 rounded-lg px-3 py-2 text-xs font-bold text-[#326eac] hover:bg-[#eaf3fb]">View / download assets</button></div>
      </div>;
    })}</div>
  </div>;
}

