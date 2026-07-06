#!/usr/bin/env node
// Recursively finds every "meaning" field in a kanji JSON file (in/*.json)
// that still needs a Vietnamese gloss, and prints the list as JSON so the
// caller (Claude) can fill in a "vi" translation for each item.
//
// Usage: node extract-meanings.js <input-file.json>

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node extract-meanings.js <input-file.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Sibling fields that give Japanese-language context for the meaning.
const CONTEXT_KEYS = [
  'japanese', 'reading', 'example', 'onyomi', 'kunyomi',
  'character', 'name', 'rad_name_ja', 'symbol', 'kname',
];

const rootKanji = data.id || (data.kanji && data.kanji.character) || '';

const items = [];

function buildContext(parent) {
  const ctx = {};
  for (const k of CONTEXT_KEYS) {
    if (parent && parent[k] !== undefined) ctx[k] = parent[k];
  }
  return ctx;
}

function alreadyDone(str) {
  return typeof str === 'string' && str.includes('|(vi)');
}

function walk(node, path) {
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, path.concat(i)));
    return;
  }
  if (node && typeof node === 'object') {
    if (Object.prototype.hasOwnProperty.call(node, 'meaning')) {
      // meaning fields that live directly under a "radical" object need a
      // Han-Viet reading prefixed to the Vietnamese gloss (see SKILL.md).
      const isRadical = path.length > 0 && path[path.length - 1] === 'radical';
      const m = node.meaning;
      if (typeof m === 'string' && !alreadyDone(m)) {
        items.push({ path: path.concat('meaning'), text: m, context: buildContext(node), kanji: rootKanji, isRadical });
      } else if (m && typeof m === 'object' && typeof m.english === 'string' && !alreadyDone(m.english)) {
        items.push({ path: path.concat('meaning', 'english'), text: m.english, context: buildContext(node), kanji: rootKanji, isRadical });
      }
    }
    for (const key of Object.keys(node)) {
      walk(node[key], path.concat(key));
    }
  }
}

walk(data, []);

console.log(JSON.stringify(items, null, 2));
