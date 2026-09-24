import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/central.css', import.meta.url), 'utf8');
assert.match(page, /import ['"]\.\/central\.css['"]/,
  'Central stylesheet must be imported by app/page.tsx.');
for (const name of new Set(page.match(/central-[a-z-]+/g))) {
  if (name === 'central-role-') continue; // Dynamic role suffix.
  assert(css.includes(`.${name}`), `Missing Central CSS selector: ${name}`);
}
for (const name of ['logo.svg', 'admin-original.png', 'tasting-room.jpg', 'sales.jpg', 'distributors.jpg']) {
  assert(existsSync(new URL(`../public/portal/${name}`, import.meta.url)), `Missing portal asset: ${name}`);
}
console.log('Central stylesheet, import, and original assets verified.');
