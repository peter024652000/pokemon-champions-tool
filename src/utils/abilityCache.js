import abilityData from '../data/ability-data.json';

const cache = new Map();

export async function getAbilityNames(apiName) {
  if (cache.has(apiName)) return cache.get(apiName);
  const local = abilityData[apiName] || {};
  const result = {
    zh: local.zh || null,
    en: local.en || null,
    zhDesc: local.zhDesc || null,
    enDesc: local.enDesc || null,
  };
  cache.set(apiName, result);
  return result;
}
