/**
 * 一次性腳本：從 PokeAPI GitHub CSV 產生中英文名稱 + 說明 JSON
 * 執行方式：node scripts/build-data.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv';
const ZH = 4;   // zh-Hant Traditional Chinese
const EN = 9;   // English

// 支援引號內換行的 CSV 解析器
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\n') {
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else if (ch !== '\r') {
        field += ch;
      }
    }
  }
  if (field || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

async function fetchCsv(filename) {
  console.log(`  Fetching ${filename}...`);
  const res = await fetch(`${BASE}/${filename}`);
  if (!res.ok) throw new Error(`Failed: ${filename} (${res.status})`);
  const text = await res.text();
  return parseCSV(text).slice(1); // skip header
}

// 從 flavor text rows 取得每個 id 最新版本的說明
function extractLatestFlavor(rows, idCol, vgCol, langCol, textCol, slugMap) {
  const result = {};
  for (const row of rows) {
    const id = row[idCol];
    const vg = Number(row[vgCol]);
    const langId = Number(row[langCol]);
    const text = row[textCol]?.replace(/[\n\f\r]+/g, ' ').trim();
    if (!text) continue;
    if (langId !== ZH && langId !== EN) continue;

    const slug = slugMap ? slugMap[id] : id;
    if (!slug) continue;

    if (!result[slug]) result[slug] = {};
    const langKey = langId === ZH ? 'zhDesc' : 'enDesc';
    const vgKey = langId === ZH ? '_zhVg' : '_enVg';

    if (!result[slug][vgKey] || vg > result[slug][vgKey]) {
      result[slug][vgKey] = vg;
      result[slug][langKey] = text;
    }
  }
  // 清掉暫存的 vg key
  for (const slug of Object.keys(result)) {
    delete result[slug]._zhVg;
    delete result[slug]._enVg;
  }
  return result;
}

async function main() {
  console.log('=== Building local name + description data from PokeAPI CSV ===\n');

  // ── 1. Pokemon 名稱 ───────────────────────────────────────────
  const speciesNamesRaw = await fetchCsv('pokemon_species_names.csv');
  const pokemonNames = {};
  for (const row of speciesNamesRaw) {
    const [id, langId, name] = row;
    if (!pokemonNames[id]) pokemonNames[id] = {};
    if (langId === String(ZH)) pokemonNames[id].zh = name;
    if (langId === String(EN)) pokemonNames[id].en = name;
  }

  // ── 2. 招式名稱 + 效果 ID ────────────────────────────────────
  // columns: id, identifier, generation_id, type_id, power, pp, accuracy, priority,
  //          target_id, damage_class_id, effect_id, effect_chance, ...
  const movesRaw = await fetchCsv('moves.csv');
  const moveSlugById = {};
  const moveEffectIdBySlug = {};
  const moveEffectChanceBySlug = {};
  for (const row of movesRaw) {
    const slug = row[1];
    moveSlugById[row[0]] = slug;
    if (slug) {
      moveEffectIdBySlug[slug] = row[10] || null;
      moveEffectChanceBySlug[slug] = row[11] || null;
    }
  }

  const moveNamesRaw = await fetchCsv('move_names.csv');
  const moveNames = {};
  for (const row of moveNamesRaw) {
    const [id, langId, name] = row;
    const slug = moveSlugById[id];
    if (!slug) continue;
    if (!moveNames[slug]) moveNames[slug] = {};
    if (langId === String(ZH)) moveNames[slug].zh = name;
    if (langId === String(EN)) moveNames[slug].en = name;
  }

  const moveData = {};
  for (const slug of Object.keys(moveNames)) {
    moveData[slug] = {
      ...moveNames[slug],
      effectId: moveEffectIdBySlug[slug] || null,
      effectChance: moveEffectChanceBySlug[slug] || null,
    };
  }

  // 取英文效果說明（輸出供翻譯對照）
  const effectProseRaw = await fetchCsv('move_effect_prose.csv');
  // columns: move_effect_id, local_language_id, short_effect, effect
  const effectEnById = {};
  for (const row of effectProseRaw) {
    if (row[1] === String(EN)) effectEnById[row[0]] = row[2]?.replace(/[\n\f\r]+/g, ' ').trim();
  }
  // 輸出所有用到的唯一效果（供建立繁中翻譯表）
  const usedEffectIds = new Set(Object.values(moveEffectIdBySlug).filter(Boolean));
  const effectsForTranslation = {};
  for (const id of [...usedEffectIds].sort((a, b) => Number(a) - Number(b))) {
    effectsForTranslation[id] = effectEnById[id] || null;
  }
  writeFileSync(join(join(__dirname, '..', 'src', 'data'), 'move-effects-en.json'), JSON.stringify(effectsForTranslation, null, 2));

  // ── 3. 特性名稱 + 說明 ────────────────────────────────────────
  const abilitiesRaw = await fetchCsv('abilities.csv');
  const abilitySlugById = {};
  for (const row of abilitiesRaw) abilitySlugById[row[0]] = row[1];

  const abilityNamesRaw = await fetchCsv('ability_names.csv');
  const abilityNames = {};
  for (const row of abilityNamesRaw) {
    const [id, langId, name] = row;
    const slug = abilitySlugById[id];
    if (!slug) continue;
    if (!abilityNames[slug]) abilityNames[slug] = {};
    if (langId === String(ZH)) abilityNames[slug].zh = name;
    if (langId === String(EN)) abilityNames[slug].en = name;
  }

  const abilityFlavorRaw = await fetchCsv('ability_flavor_text.csv');
  // columns: ability_id, version_group_id, language_id, flavor_text
  const abilityFlavor = extractLatestFlavor(abilityFlavorRaw, 0, 1, 2, 3, abilitySlugById);
  const abilityData = {};
  for (const slug of new Set([...Object.keys(abilityNames), ...Object.keys(abilityFlavor)])) {
    abilityData[slug] = { ...abilityNames[slug], ...abilityFlavor[slug] };
  }

  // ── 4. 寫入 JSON ──────────────────────────────────────────────
  const dataDir = join(__dirname, '..', 'src', 'data');
  mkdirSync(dataDir, { recursive: true });

  writeFileSync(join(dataDir, 'pokemon-names.json'), JSON.stringify(pokemonNames));
  writeFileSync(join(dataDir, 'move-data.json'), JSON.stringify(moveData));
  writeFileSync(join(dataDir, 'ability-data.json'), JSON.stringify(abilityData));

  // 相容舊的 move-names.json / ability-names.json（避免 import 路徑錯誤）
  writeFileSync(join(dataDir, 'move-names.json'), JSON.stringify(
    Object.fromEntries(Object.entries(moveData).map(([k, v]) => [k, { zh: v.zh, en: v.en }]))
  ));
  writeFileSync(join(dataDir, 'ability-names.json'), JSON.stringify(
    Object.fromEntries(Object.entries(abilityData).map(([k, v]) => [k, { zh: v.zh, en: v.en }]))
  ));

  const zhAbilityDesc = Object.values(abilityData).filter(v => v.zhDesc).length;

  console.log('\n=== 完成 ===');
  console.log(`寶可夢名稱：${Object.keys(pokemonNames).length} 筆`);
  console.log(`招式：${Object.keys(moveData).length} 筆（唯一效果類型：${usedEffectIds.size} 種）`);
  console.log(`特性：${Object.keys(abilityData).length} 筆（繁中說明：${zhAbilityDesc} 筆）`);
  console.log(`\n已輸出英文效果清單至 src/data/move-effects-en.json（供翻譯）`);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
