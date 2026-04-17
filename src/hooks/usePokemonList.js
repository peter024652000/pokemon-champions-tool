import { useState, useEffect } from 'react';
import { fetchWithCache } from '../utils/pokeapi';
import { CHAMPIONS_IDS, MEGA_ENTRIES, ROTOM_FORMS, REGIONAL_FORMS, BASE_FORM_LABELS } from '../utils/championsIds';
import pokemonNamesData from '../data/pokemon-names.json';

const BASE = 'https://pokeapi.co/api/v2';
const BATCH = 20;

// Derive an English form label from the PokeAPI name
function enLabelFromApiName(apiName) {
  if (apiName.includes('-alola'))          return 'Alolan Form';
  if (apiName.includes('-galar'))          return 'Galarian Form';
  if (apiName.includes('-hisui'))          return 'Hisuian Form';
  if (apiName.includes('-paldea-combat'))  return 'Paldean Form (Combat)';
  if (apiName.includes('-paldea-blaze'))   return 'Paldean Form (Blaze)';
  if (apiName.includes('-paldea-aqua'))    return 'Paldean Form (Aqua)';
  if (apiName.includes('-midday'))         return 'Midday Form';
  if (apiName.includes('-midnight'))       return 'Midnight Form';
  if (apiName.includes('-dusk'))           return 'Dusk Form';
  if (apiName.includes('-eternal'))        return 'Eternal Flower';
  if (apiName.includes('-female'))         return '♀';
  if (apiName.includes('-small'))          return 'Small Form';
  if (apiName.includes('-large'))          return 'Large Form';
  if (apiName.includes('-super'))          return 'Super Form';
  if (apiName === 'rotom-heat')  return 'Heat';
  if (apiName === 'rotom-wash')  return 'Wash';
  if (apiName === 'rotom-fan')   return 'Fan';
  if (apiName === 'rotom-frost') return 'Frost';
  if (apiName === 'rotom-mow')   return 'Mow';
  return null;
}

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
    const baseLabel = BASE_FORM_LABELS[id];
    entries.push({
      id,
      apiName: String(id),
      variantLabel: baseLabel?.zh || null,
      enLabel: baseLabel?.en || null,
      isMega: false,
    });
    if (byBase[id]) {
      for (const v of byBase[id]) {
        entries.push({
          id,
          apiName: v.apiName,
          variantLabel: v.label,
          enLabel: enLabelFromApiName(v.apiName),
          isMega: v.isMega,
        });
      }
    }
  }
  return entries;
}

export const INITIAL_ENTRIES = buildEntries();

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

    function loadNames() {
      setList(prev => prev.map(e => {
        const entry = pokemonNamesData[String(e.id)];
        return entry ? { ...e, zhName: entry.zh || null, enName: entry.en || null } : e;
      }));
    }

    loadNames();
    loadPokemon().catch(console.error);
    return () => { active = false; };
  }, []);

  return { list, loadedCount, total };
}
