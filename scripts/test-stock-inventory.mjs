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
  ...cols.map(([text, x]) => ({ text, x, y: 160 })),
  ...row(190, 'AUTUMNHARVEST', '01082025', '', '7.67'),
  ...row(205, 'AUTUMNHARVEST', '15082026', '', '9.00'),
  ...row(220, 'AUTUMNHARVEST', '15082026', '292465', '0.50'),
  ...row(235, 'MERCHTAG', '', '', '99.00'),
] };
const result = parseStockStatusPages([firstPage], 'example.pdf');
assert.equal(result.totals.length, 1);
assert.equal(result.totals[0].productCode, 'AUTUMNHARVEST');
assert.equal(result.totals[0].stockQty, 16.67);
assert.equal(result.includedRows.length, 2);
assert.equal(result.excludedRows.length, 2);
assert.equal(result.excludedRows[0].reason, 'DEST DOC populated');
assert.equal(result.excludedRows[1].reason, 'No lot number');
console.log('Inventory stock parsing regression test passed.');
