import { useState, useEffect } from 'react';
import { fetchWithCache } from '../utils/pokeapi';
import { CHAMPIONS_IDS, MEGA_ENTRIES, ROTOM_FORMS, REGIONAL_FORMS } from '../utils/championsIds';

const BASE = 'https://pokeapi.co/api/v2';
const BATCH = 20;

// Build the full ordered list: for each base id, add base → megas → rotom/regional forms
function buildEntries() {
  const variants = [
    ...MEGA_ENTRIES.map(e => ({ ...e, isMega: true })),
    ...ROTOM_FORMS.map(e => ({ ...e, isMega: false })),
    ...REGIONAL_FORMS.map(e => ({ ...e, isMega: false })),
  ];

  const byBase = {};
  for (const v of variants) {
    if (!byBase[v.baseId]) byBase[v.baseId] = [];
    byBase[v.baseId].push(v);
  }

  const entries = [];
  for (const id of CHAMPIONS_IDS) {
    entries.push({ id, apiName: String(id), variantLabel: null, isMega: false });
    if (byBase[id]) {
      for (const v of byBase[id]) {
        entries.push({ id, apiName: v.apiName, variantLabel: v.label, isMega: v.isMega });
      }
    }
  }
  return entries;
}

const INITIAL_ENTRIES = buildEntries();

export function usePokemonList() {
  const [list, setList] = useState(() =>
    INITIAL_ENTRIES.map(e => ({ ...e, loaded: false }))
  );
  const [loadedCount, setLoadedCount] = useState(0);
  const total = INITIAL_ENTRIES.length;

  useEffect(() => {
    let active = true;
    const allApiNames = INITIAL_ENTRIES.map(e => e.apiName);
    const baseIds = [...new Set(CHAMPIONS_IDS)];

    async function loadPokemon() {
      for (let i = 0; i < allApiNames.length; i += BATCH) {
        if (!active) return;
        const batch = allApiNames.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map(name => fetchWithCache(`${BASE}/pokemon/${name}`))
        );
        if (!active) return;
        const map = {};
        results.forEach((r, idx) => {
          const key = batch[idx];
          if (r.status === 'fulfilled') {
            const p = r.value;
            map[key] = {
              name: p.name,
              types: p.types.map(t => t.type.name),
              sprite: p.sprites?.front_default || null,
              abilities: p.abilities || [],
              stats: p.stats || [],
              loaded: true,
            };
          } else {
            // 404 or other error — mark as unavailable so it won't show as eternal skeleton
            map[key] = { loaded: true, unavailable: true };
          }
        });
        setList(prev => prev.map(e => map[e.apiName] ? { ...e, ...map[e.apiName] } : e));
        setLoadedCount(i + batch.length);
      }
    }

    async function loadNames() {
      for (let i = 0; i < baseIds.length; i += BATCH) {
        if (!active) return;
        const batch = baseIds.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map(id => fetchWithCache(`${BASE}/pokemon-species/${id}`))
        );
        if (!active) return;
        const map = {};
        results.forEach(r => {
          if (r.status === 'fulfilled') {
            const s = r.value;
            const zhName =
              s.names?.find(n => n.language.name === 'zh-Hant')?.name ||
              s.names?.find(n => n.language.name === 'zh-Hans')?.name ||
              null;
            if (zhName) map[s.id] = zhName;
          }
        });
        setList(prev => prev.map(e => map[e.id] ? { ...e, zhName: map[e.id] } : e));
      }
    }

    Promise.all([loadPokemon(), loadNames()]).catch(console.error);
    return () => { active = false; };
  }, []);

  return { list, loadedCount, total };
}
