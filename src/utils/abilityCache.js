import { fetchWithCache } from './pokeapi';

const BASE = 'https://pokeapi.co/api/v2';
const cache = new Map();

export async function getAbilityNames(apiName) {
  if (cache.has(apiName)) return cache.get(apiName);
  const data = await fetchWithCache(`${BASE}/ability/${apiName}`);
  const zh =
    data.names?.find(n => n.language.name === 'zh-Hant')?.name ||
    data.names?.find(n => n.language.name === 'zh-Hans')?.name ||
    null;
  const en = data.names?.find(n => n.language.name === 'en')?.name || null;
  const result = { zh, en };
  cache.set(apiName, result);
  return result;
}
