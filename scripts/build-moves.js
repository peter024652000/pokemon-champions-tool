/**
 * build-moves.js
 * 從 projectpokemon/champout (MIT) 重建 move-data.json
 * 資料來源：
 *   - masterdata/waza.json           → 495 個 Champions 可用招式（available=1）
 *   - rom-txt/usa/wazaname.json       → 英文名稱
 *   - rom-txt/tch/wazaname.json       → 繁中名稱
 *   - rom-txt/usa/wazainfo_syn.json   → 英文效果說明（已含實際數值，無需 $effect_chance% 替換）
 *   - rom-txt/tch/wazainfo_syn.json   → 繁中效果說明
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://raw.githubusercontent.com/projectpokemon/champout/main';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} → ${res.status}`);
  return res.json();
}

function toSlug(englishName) {
  return englishName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // remove apostrophes, special chars
    .trim()
    .replace(/\s+/g, '-');
}

const TYPE_MAP = {
  '0': 'normal', '1': 'fighting', '2': 'flying',  '3': 'poison',
  '4': 'ground', '5': 'rock',     '6': 'bug',      '7': 'ghost',
  '8': 'steel',  '9': 'fire',     '10': 'water',   '11': 'grass',
  '12': 'electric', '13': 'psychic', '14': 'ice',  '15': 'dragon',
  '16': 'dark',  '17': 'fairy',
};

const CATEGORY_MAP = {
  '0': 'physical',
  '1': 'special',
  '2': 'status',
};

async function main() {
  console.log('Fetching champout move data...');
  const [masterWaza, engNames, tchNames, engInfo, tchInfo] = await Promise.all([
    fetchJson(`${BASE}/masterdata/waza.json`),
    fetchJson(`${BASE}/rom-txt/usa/wazaname.json`),
    fetchJson(`${BASE}/rom-txt/tch/wazaname.json`),
    fetchJson(`${BASE}/rom-txt/usa/wazainfo_syn.json`),
    fetchJson(`${BASE}/rom-txt/tch/wazainfo_syn.json`),
  ]);

  const engNameMap = Object.fromEntries(engNames.mSDataSet.map(e => [e.LabelName, e.OriginalText]));
  const tchNameMap = Object.fromEntries(tchNames.mSDataSet.map(e => [e.LabelName, e.OriginalText]));
  const engInfoMap = Object.fromEntries(engInfo.mSDataSet.map(e => [e.LabelName, e.OriginalText]));
  const tchInfoMap = Object.fromEntries(tchInfo.mSDataSet.map(e => [e.LabelName, e.OriginalText]));

  const available = masterWaza.filter(w => w.available === '1');
  console.log(`Available moves: ${available.length}`);

  const result = {};
  let ok = 0, noName = 0;

  for (const waza of available) {
    const nameLabel = waza.ms_lbl;       // e.g. "WAZANAME_001"
    const infoLabel = waza.ms_lbl_info;  // e.g. "WAZAINFO_SYN_007" or "WAZAINFO_SYN_null"

    const en = engNameMap[nameLabel];
    const zh = tchNameMap[nameLabel];

    if (!en) { noName++; continue; }

    const slug = toSlug(en);
    const enEffect = infoLabel && infoLabel !== 'WAZAINFO_SYN_null' ? (engInfoMap[infoLabel] || null) : null;
    const zhEffect = infoLabel && infoLabel !== 'WAZAINFO_SYN_null' ? (tchInfoMap[infoLabel] || null) : null;

    result[slug] = {
      zh: zh || en,
      en,
      type: TYPE_MAP[waza.type] || 'normal',
      category: CATEGORY_MAP[waza.category] || 'status',
      power: waza.power !== '0' ? parseInt(waza.power) : null,
      accuracy: waza.accuracy !== '0' ? parseInt(waza.accuracy) : null,
      pp: parseInt(waza.pp),
      priority: parseInt(waza.priority) || 0,
      enEffect,
      zhEffect,
    };
    ok++;
  }

  console.log(`Written: ${ok}, skipped (no name): ${noName}`);

  const outPath = join(__dirname, '../src/data/move-data.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
