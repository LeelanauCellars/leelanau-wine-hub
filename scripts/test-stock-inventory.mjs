import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');

const src = readFileSync(new URL('../lib/stock-inventory.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
vm.runInNewContext(output, { exports: module.exports, module, Map, Set, Date, Error, Number, Math, RegExp }, { filename: 'stock-inventory.cjs' });
const { parseStockStatusPages } = module.exports;
const cols = [
  ['PRODUCT CODE', 23], ['LOT NUMBER', 191], ['DEST DOC', 359], ['DEST REL', 422], ['RECEIPT DATE', 485], ['STKQTY', 649],
];
const row = (y, product, lot, dest, qty) => [
  { text: product, x: 23, y },
  ...(lot ? [{ text: lot, x: 191, y }] : []),
  ...(dest ? [{ text: dest, x: 359, y }, { text: '001', x: 422, y }] : []),
  { text: '10/30/2026', x: 485, y },
  { text: String(qty), x: 649, y },
];
const firstPage = { page: 1, words: [
  { text: 'COST CENTER : 102 - 102', x: 90, y: 40 },
  ...cols.map(([text, x]) => ({ text, x, y: 160 })),
  ...row(190, 'AUTUMNHARVEST', '01082025', '', '7.67'),
  ...row(205, 'AUTUMNHARVEST', '15082026', '', '9.00'),
  ...row(220, 'AUTUMNHARVEST', '15082026', '292465', '0.50'),
  ...row(235, 'MERCHTAG', '', '', '99.00'),
  ...row(250, 'SHIPPER12PACK', '15082026', '', '9.00'),
  ...row(265, 'SHIPPER6PACK', '', '', '12.00'),
] };
const result = parseStockStatusPages([firstPage], 'example.pdf');
assert.equal(result.costCenter, '102');
assert.equal(result.totals.length, 1);
assert.equal(result.totals[0].productCode, 'AUTUMNHARVEST');
assert.equal(result.totals[0].stockQty, 16.67);
assert.equal(result.includedRows.length, 2);
assert.equal(result.excludedRows.length, 4);
assert.equal(result.excludedRows[0].reason, 'DEST DOC populated');
assert.equal(result.excludedRows[1].reason, 'No lot number');
assert.equal(result.excludedRows[2].reason, 'Shipper item');
assert.equal(result.excludedRows[3].reason, 'Shipper item');
const merch = parseStockStatusPages([firstPage], 'example.pdf', { mode: 'merch' });
assert.equal(merch.includedRows.length, 3);
assert.equal(merch.totals.length, 2);
assert.equal(merch.totals.find((item) => item.productCode === 'MERCHTAG').stockQty, 99);
assert.equal(merch.excludedRows.some((item) => item.reason === 'No lot number'), false);
const all = parseStockStatusPages([firstPage], 'example.pdf', { mode: 'merch', excludeShippers: false });
assert.equal(all.includedRows.length, 5);
assert.equal(all.totals.find((item) => item.productCode === 'SHIPPER12PACK').stockQty, 9);
// A 104 report must be automatically identified as e-commerce stock.
const ecommPage = { ...firstPage, words: firstPage.words.map((word) =>
  word.text.includes('COST CENTER : 102') ? { ...word, text: 'COST CENTER : 104 - 104' } : word) };
assert.equal(parseStockStatusPages([ecommPage], '104.pdf').costCenter, '104');
// A report that mixes 102/104 must never be routed to either workbook tab.
const mixed = parseStockStatusPages([firstPage, { ...ecommPage, page: 2 }], 'mixed.pdf');
assert.equal(mixed.costCenter, null);
assert.equal(mixed.reportCostCenters.join(','), '102,104');
// Unknown center remains exportable but cannot auto-fill a workbook.
const unidentified = parseStockStatusPages([{ ...firstPage, words: firstPage.words.filter((word) => !word.text.includes('COST CENTER')) }], 'unknown.pdf');
assert.equal(unidentified.costCenter, null);
console.log('Wine/merch filtering and 102/104/mixed cost-center detection tests passed.');
