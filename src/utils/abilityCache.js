import { fetchWithCache } from './pokeapi';
import abilityNamesData from '../data/ability-names.json';

const BASE = 'https://pokeapi.co/api/v2';
const cache = new Map();

export async function getAbilityNames(apiName) {
  if (cache.has(apiName)) return cache.get(apiName);

  // 優先使用本地 JSON（完整繁中）
  const local = abilityNamesData[apiName];
  if (local) {
    const result = {
      zh: local.zh || null,
      en: local.en || null,
      zhDesc: null,
      enDesc: null,
    };
    // 說明還是要打 API 取（CSV 沒有說明文字）
    try {
      const data = await fetchWithCache(`${BASE}/ability/${apiName}`);
      result.zhDesc =
        data.flavor_text_entries?.filter(e => e.language.name === 'zh-Hant').pop()?.flavor_text?.replace(/[\n\f]/g, ' ') ||
        data.flavor_text_entries?.filter(e => e.language.name === 'zh-Hans').pop()?.flavor_text?.replace(/[\n\f]/g, ' ') ||
        null;
      result.enDesc =
        data.flavor_text_entries?.filter(e => e.language.name === 'en').pop()?.flavor_text?.replace(/[\n\f]/g, ' ') ||
        null;
    } catch {
      // 說明抓不到沒關係，名稱已有
    }
    cache.set(apiName, result);
    return result;
  }

  // fallback：完全從 PokeAPI 取
  const data = await fetchWithCache(`${BASE}/ability/${apiName}`);
  const zh =
    data.names?.find(n => n.language.name === 'zh-Hant')?.name ||
    data.names?.find(n => n.language.name === 'zh-Hans')?.name ||
    null;
  const en = data.names?.find(n => n.language.name === 'en')?.name || null;
  const zhDesc =
    data.flavor_text_entries?.filter(e => e.language.name === 'zh-Hant').pop()?.flavor_text?.replace(/[\n\f]/g, ' ') ||
    null;
  const enDesc =
    data.flavor_text_entries?.filter(e => e.language.name === 'en').pop()?.flavor_text?.replace(/[\n\f]/g, ' ') ||
    null;

  const result = { zh, en, zhDesc, enDesc };
  cache.set(apiName, result);
  return result;
}
