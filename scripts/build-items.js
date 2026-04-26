/**
 * build-items.js
 * 從 projectpokemon/champout (MIT) 的 ROM dump 建立 item-data.json
 * 資料來源：
 *   - masterdata/item.json      → 117 個 Champions 可用道具（含 ID）
 *   - rom-txt/usa/itemname.json → 英文名稱
 *   - rom-txt/tch/itemname.json → 繁中名稱
 * Sprite URL 用 PokeAPI slug 規則自動推導，Champions 原創道具若 PokeAPI 無圖則顯示空白
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
    .replace(/[^a-z0-9\- ]/g, '') // keep hyphens; remove apostrophes and other special chars
    .trim()
    .replace(/\s+/g, '-')         // spaces → hyphens
    .replace(/-+/g, '-');         // collapse consecutive hyphens
}

// champout category_a → our UI category labels
function getCategory(category_a) {
  switch (category_a) {
    case '1':  return 'STAT_BOOST';   // White Herb, Choice Scarf, Light Ball
    case '2':  return 'POWER_BOOST';  // type-boosting items (Metal Coat, Charcoal, etc.)
    case '3':  return 'STAT_BOOST';   // Focus Band, Focus Sash
    case '4':  return 'RECOVERY';     // Leftovers, Shell Bell, Mental Herb
    case '6':  return 'BERRY';        // all berries (healing + resistance)
    case '8':  return 'MEGA_STONE';
    case '10': return 'OTHER';        // Bright Powder, Quick Claw, King's Rock, Scope Lens
    default:   return 'OTHER';
  }
}

async function main() {
  console.log('Fetching champout data...');
  const [masterItems, engRaw, tchRaw, engInfoRaw, tchInfoRaw] = await Promise.all([
    fetchJson(`${BASE}/masterdata/item.json`),
    fetchJson(`${BASE}/rom-txt/usa/itemname.json`),
    fetchJson(`${BASE}/rom-txt/tch/itemname.json`),
    fetchJson(`${BASE}/rom-txt/usa/iteminfo_syn.json`),
    fetchJson(`${BASE}/rom-txt/tch/iteminfo_syn.json`),
  ]);

  const engMap = Object.fromEntries(engRaw.mSDataSet.map(e => [e.LabelName, e.OriginalText]));
  const tchMap = Object.fromEntries(tchRaw.mSDataSet.map(e => [e.LabelName, e.OriginalText]));
  const engInfoMap = Object.fromEntries(engInfoRaw.mSDataSet.map(e => [e.LabelName, e.OriginalText.replace(/\n/g, ' ')]));
  const tchInfoMap = Object.fromEntries(tchInfoRaw.mSDataSet.map(e => [e.LabelName, e.OriginalText.replace(/\n/g, ' ')]));

  const result = {};
  let ok = 0, skip = 0;

  for (const item of masterItems) {
    const label = item.ms_lbl; // e.g. "ITEMNAME_149"
    const en = engMap[label];
    const zh = tchMap[label];

    if (!en) { skip++; continue; }

    const slug = toSlug(en);
    const category = getCategory(item.category_a);
    const infoLabel = item.ms_lbl_info;
    const enEffect = infoLabel ? (engInfoMap[infoLabel] || null) : null;
    const zhEffect = infoLabel ? (tchInfoMap[infoLabel] || null) : null;

    result[slug] = {
      en,
      zh: zh || en,
      category,
      ...(enEffect ? { enEffect } : {}),
      ...(zhEffect ? { zhEffect } : {}),
    };
    ok++;
    process.stdout.write(`  ${slug}: ${zh || en}\n`);
  }

  console.log(`\nDone: ${ok} items, ${skip} skipped`);

  const outPath = join(__dirname, '../src/data/item-data.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Written to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
