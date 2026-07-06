#!/usr/bin/env node
// Applies Vietnamese translations (produced by Claude for the items listed
// by extract-meanings.js) back into the kanji JSON, then writes the result
// into out/.
//
// Usage: node apply-meanings.js <input.json> <translations.json> <output.json>
// translations.json: [{ "path": [...], "vi": "..." }, ...]

const fs = require('fs');
const path = require('path');

const [, , inputFile, translationsFile, outputFile] = process.argv;
if (!inputFile || !translationsFile || !outputFile) {
  console.error('Usage: node apply-meanings.js <input.json> <translations.json> <output.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const translations = JSON.parse(fs.readFileSync(translationsFile, 'utf8'));

for (const { path: keyPath, vi } of translations) {
  let node = data;
  for (let i = 0; i < keyPath.length - 1; i++) {
    node = node[keyPath[i]];
  }
  const lastKey = keyPath[keyPath.length - 1];
  const current = node ? node[lastKey] : undefined;
  if (typeof current !== 'string') {
    console.error('Skip: target is not a string at path', keyPath.join('.'));
    continue;
  }
  if (current.includes('|(vi)')) continue; // idempotent: already applied
  node[lastKey] = `${current} |(vi) ${vi}`;
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Wrote', outputFile);
