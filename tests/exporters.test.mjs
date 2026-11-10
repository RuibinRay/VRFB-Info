import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toCSV, toXLSX, zipStore, crc32, pdfFromJpegs } from '../js/sim/exporters.js';

const dec = new TextDecoder();

test('CSV quoting', () => {
  const csv = toCSV([['a', 'b,c', 'say "hi"'], [1, 2.5, 'línea\n2'], ['钒', null, '']]);
  assert.ok(csv.startsWith('﻿'));
  assert.equal(csv.slice(1), 'a,"b,c","say ""hi"""\r\n1,2.5,"línea\n2"\r\n钒,,\r\n');
});

test('CRC-32 matches the standard check value', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xCBF43926);
});

test('XLSX is a valid zip with the expected parts', () => {
  const bytes = toXLSX([{ name: 'Inputs', rows: [['Parameter', 'Value'], ['Power (MW)', 10], ['注释', 'año & <tag>']] }, { name: 'Cash flow', rows: [['Year', 'Net'], [1, -5.5], [2, 7]] }]);
  assert.equal(dec.decode(bytes.slice(0, 2)), 'PK');
  const text = dec.decode(bytes);
  for (const part of ['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/styles.xml']) assert.ok(text.includes(part), `contains ${part}`);
  assert.ok(text.includes('<sheet name="Inputs"') && text.includes('<sheet name="Cash flow"'));
  assert.ok(text.includes('<c r="B2"><v>10</v></c>'), 'numbers are stored as numbers');
  assert.ok(text.includes('año &amp; &lt;tag&gt;'), 'text is XML-escaped');
  // end-of-central-directory record: entry count and offsets are self-consistent
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), eocd = bytes.length - 22;
  assert.equal(v.getUint32(eocd, true), 0x06054b50);
  assert.equal(v.getUint16(eocd + 10, true), 7);
  const cdOffset = v.getUint32(eocd + 16, true); assert.equal(v.getUint32(cdOffset, true), 0x02014b50);
});

test('XLSX opens with an independent zip reader', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'vrfb-')), file = join(dir, 't.xlsx');
  writeFileSync(file, toXLSX([{ name: 'Data', rows: [['x', 'y'], [1, 2], [3, 4]] }]));
  let out;
  try { out = execFileSync('python3', ['-c', 'import zipfile,sys\nz=zipfile.ZipFile(sys.argv[1])\nassert z.testzip() is None\nprint(len(z.namelist()));print(z.read("xl/worksheets/sheet1.xml").decode()[:60])', file]).toString(); }
  catch (e) { if (e.code === 'ENOENT') return t.skip('python3 not available'); throw e; }
  assert.ok(out.startsWith('6\n'), 'six parts, all CRCs valid'); assert.ok(out.includes('<?xml'));
});

test('PDF structure and cross-reference table', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const pdf = pdfFromJpegs([{ jpeg, width: 1240, height: 1754 }, { jpeg, width: 1240, height: 900 }]);
  const text = dec.decode(pdf);
  assert.ok(text.startsWith('%PDF-1.4')); assert.ok(text.trimEnd().endsWith('%%EOF'));
  assert.ok(text.includes('/Count 2') && text.includes('/Filter /DCTDecode'));
  const startxref = Number(text.match(/startxref\n(\d+)/)[1]);
  assert.equal(dec.decode(pdf.slice(startxref, startxref + 4)), 'xref');
  const entries = [...text.slice(startxref).matchAll(/(\d{10}) 00000 n /g)].map(m => Number(m[1]));
  assert.equal(entries.length, 8, 'catalog, pages and three objects per page');
  entries.forEach((off, i) => assert.equal(dec.decode(pdf.slice(off, off + `${i + 1} 0 obj`.length)), `${i + 1} 0 obj`, `object ${i + 1} offset`));
  assert.equal(zipStore([]).length, 22);
});
