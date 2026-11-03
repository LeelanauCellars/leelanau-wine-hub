import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const src = readFileSync(new URL('../lib/inventory-template.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(js, { exports: mod.exports, module: mod, Map, Set, String, Number, Array, Math, RegExp }, { filename:'inventory-template.js' });
const { listTemplateTargets, fillTemplate, findWineTarget, expectedWineSheet } = mod.exports;
const data = [[], [], [], ['E21 Product Code','Product Name','Physical Inventory','E21 Stock Status','Change'],
  ['AUTUMNHARVEST','Autumn Harvest',0,null,{formula:'D5-C5'}],
  ['FRESHBLACKBERRY','Fresh Blackberry',0,1.5,{formula:'D6-C6'}],
  ['SHIPPERCODE','Shipping item',0,null,null],
  ['MISSING','Unknown',0,null,null]];
function fakeSheet(name) {
  const arr=data.map(row=>row.map(value=>({value})));
  return {
    name,
    rowCount:arr.length,
    getRow(n) {
      return {
        getCell(c) { if (!arr[n-1]) arr[n-1]=[]; if (!arr[n-1][c-1]) arr[n-1][c-1]={value:null}; return arr[n-1][c-1]; },
        eachCell(_opts, cb) { (arr[n-1]||[]).forEach((cell,i)=>{ if (cell.value !== null && cell.value !== undefined) cb(cell,i+1); }); },
      }
    }
  }
}
const sheet = fakeSheet('TR - E21');
const book = {worksheets:[sheet],getWorksheet(name){return name===sheet.name?sheet:null}};
const totals=[{productCode:'AUTUMNHARVEST', stockQty:17.67, rows:3},{productCode:'FRESHBLACKBERRY',stockQty:3,rows:1}];
const candidates=listTemplateTargets(book,totals);
assert.equal(candidates.length,1);
assert.equal(candidates[0].sheetName,'TR - E21');
assert.equal(candidates[0].matches,2);
assert.equal(candidates[0].readyToFill,1);
assert.equal(expectedWineSheet('102'), 'TR - E21');
assert.equal(expectedWineSheet('104'), 'ECOMM - E21');
assert.equal(findWineTarget(candidates, '102').sheetName, 'TR - E21');
assert.equal(findWineTarget(candidates, '104'), null);
assert.equal(candidates[0].existingValues,1);
const preview=fillTemplate(book,totals,candidates[0],false);
assert.equal(preview.updated,1);
assert.equal(preview.skippedExisting,1);
assert.equal(sheet.getRow(5).getCell(4).value,17.67);
assert.equal(sheet.getRow(6).getCell(4).value,1.5);
assert.deepEqual(JSON.parse(JSON.stringify(sheet.getRow(5).getCell(5).value)),{formula:'D5-C5'});
const replacing=fillTemplate(book,totals,candidates[0],true);
assert.equal(replacing.updated,2);
assert.equal(sheet.getRow(6).getCell(4).value,3);
// Multi-worksheet workbook: 104 must route ONLY to ECOMM; 102 ONLY to TR.
const ecommSheet = fakeSheet('ECOMM - E21');
const both = { worksheets: [sheet,ecommSheet], getWorksheet(name){return this.worksheets.find((item) => item.name === name);} };
const bothTargets = listTemplateTargets(both, totals);
assert.equal(findWineTarget(bothTargets,'102').sheetName, 'TR - E21');
assert.equal(findWineTarget(bothTargets,'104').sheetName, 'ECOMM - E21');
const beforeTR = sheet.getRow(5).getCell(4).value;
const ecommTarget = findWineTarget(bothTargets,'104');
const resultEcomm = fillTemplate(both,totals,ecommTarget,true);
assert.equal(resultEcomm.updated,2);
assert.equal(sheet.getRow(5).getCell(4).value, beforeTR);
assert.equal(ecommSheet.getRow(5).getCell(4).value, 17.67);
console.log('Inventory 102/104 routing, existing-cell update, other-tab isolation and formula protection passed.');
