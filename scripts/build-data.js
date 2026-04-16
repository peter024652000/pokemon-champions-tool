/**
 * 一次性腳本：從 PokeAPI GitHub CSV 產生中英文名稱 JSON
 * 執行方式：node scripts/build-data.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv';
const ZH = 4;   // zh-Hant Traditional Chinese
const EN = 9;   // English

async function fetchCsv(filename) {
  console.log(`  Fetching ${filename}...`);
  const res = await fetch(`${BASE}/${filename}`);
  if (!res.ok) throw new Error(`Failed to fetch ${filename}: ${res.status}`);
  const text = await res.text();
  return text.trim().split('\n').slice(1).map(line => line.split(','));
}

async function main() {
  console.log('=== Building local name data from PokeAPI CSV ===\n');

  // ── 1. Pokemon 名稱 ───────────────────────────────────────────
  const speciesNamesRaw = await fetchCsv('pokemon_species_names.csv');
  // columns: pokemon_species_id, local_language_id, name, genus
  const pokemonNames = {};
  for (const row of speciesNamesRaw) {
    const [id, langId, name] = row;
    if (!pokemonNames[id]) pokemonNames[id] = {};
    if (langId === String(ZH)) pokemonNames[id].zh = name;
    if (langId === String(EN)) pokemonNames[id].en = name;
  }

  // ── 2. 招式名稱 ───────────────────────────────────────────────
  // 先建 id → slug 對照
  const movesRaw = await fetchCsv('moves.csv');
  // columns: id, identifier, generation_id, type_id, power, pp, ...
  const moveSlugById = {};
  for (const row of movesRaw) {
    moveSlugById[row[0]] = row[1];
  }

  const moveNamesRaw = await fetchCsv('move_names.csv');
  // columns: move_id, local_language_id, name
  const moveNames = {};
  for (const row of moveNamesRaw) {
    const [id, langId, name] = row;
    const slug = moveSlugById[id];
    if (!slug) continue;
    if (!moveNames[slug]) moveNames[slug] = {};
    if (langId === String(ZH)) moveNames[slug].zh = name;
    if (langId === String(EN)) moveNames[slug].en = name;
  }

  // ── 3. 特性名稱 ───────────────────────────────────────────────
  const abilitiesRaw = await fetchCsv('abilities.csv');
  // columns: id, identifier, generation_id, is_main_series
  const abilitySlugById = {};
  for (const row of abilitiesRaw) {
    abilitySlugById[row[0]] = row[1];
  }

  const abilityNamesRaw = await fetchCsv('ability_names.csv');
  // columns: ability_id, local_language_id, name
  const abilityNames = {};
  for (const row of abilityNamesRaw) {
    const [id, langId, name] = row;
    const slug = abilitySlugById[id];
    if (!slug) continue;
    if (!abilityNames[slug]) abilityNames[slug] = {};
    if (langId === String(ZH)) abilityNames[slug].zh = name;
    if (langId === String(EN)) abilityNames[slug].en = name;
  }

  // ── 4. 寫入 JSON ──────────────────────────────────────────────
  const dataDir = join(__dirname, '..', 'src', 'data');
  mkdirSync(dataDir, { recursive: true });

  writeFileSync(join(dataDir, 'pokemon-names.json'), JSON.stringify(pokemonNames));
  writeFileSync(join(dataDir, 'move-names.json'), JSON.stringify(moveNames));
  writeFileSync(join(dataDir, 'ability-names.json'), JSON.stringify(abilityNames));

  console.log('\n=== 完成 ===');
  console.log(`寶可夢名稱：${Object.keys(pokemonNames).length} 筆`);
  console.log(`招式名稱：${Object.keys(moveNames).length} 筆`);
  console.log(`特性名稱：${Object.keys(abilityNames).length} 筆`);
  console.log('\n產生的檔案：');
  console.log('  src/data/pokemon-names.json');
  console.log('  src/data/move-names.json');
  console.log('  src/data/ability-names.json');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
