const BASE_URL = 'https://pokeapi.co/api/v2';
const cache = new Map();

export async function fetchWithCache(url) {
  if (cache.has(url)) return cache.get(url);
  const p = fetch(url).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
  cache.set(url, p);
  return p;
}

export async function fetchPokedex(name) {
  return fetchWithCache(`${BASE_URL}/pokedex/${name}`);
}

export async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase().replace(/\s+/g, '-');
  return fetchWithCache(`${BASE_URL}/pokemon/${key}`);
}

export async function fetchPokemonSpecies(nameOrId) {
  const key = String(nameOrId).toLowerCase().replace(/\s+/g, '-');
  return fetchWithCache(`${BASE_URL}/pokemon-species/${key}`);
}

export async function fetchMove(nameOrId) {
  const key = String(nameOrId).toLowerCase().replace(/\s+/g, '-');
  return fetchWithCache(`${BASE_URL}/move/${key}`);
}

export function getChineseName(names = []) {
  return (
    names.find(n => n.language.name === 'zh-Hant')?.name ||
    names.find(n => n.language.name === 'zh-Hans')?.name ||
    null
  );
}

export function getSpriteUrl(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default ||
    null
  );
}

export function getEVYield(pokemon) {
  return pokemon.stats
    .filter(s => s.effort > 0)
    .map(s => ({ stat: s.stat.name, effort: s.effort }));
}
