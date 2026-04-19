import { useState, useEffect } from 'react';
import TypeBadge from './TypeBadge';
import BaseStats from './BaseStats';
import TypeEffectiveness from './TypeEffectiveness';
import MoveList from './MoveList';
import { getSpriteUrl } from '../utils/pokeapi';
import { MEGA_SIGIL_URL } from '../utils/constants';
import { getAbilityNames } from '../utils/abilityCache';
import { useLang } from '../context/LangContext';
import pokemonNamesData from '../data/pokemon-names.json';

const TABS = [
  { id: 'stats', zh: '種族值',   en: 'Base Stats'  },
  { id: 'types', zh: '屬性相剋', en: 'Type Chart'  },
  { id: 'moves', zh: '招式列表', en: 'Moves'       },
];

function formatAbility(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function PokemonCard({ pokemon, species, variantLabel, isMegaVariant, speciesId }) {
  const [tab, setTab] = useState('stats');
  const [abilityNames, setAbilityNames] = useState({});
  const { lang } = useLang();

  useEffect(() => {
    if (!pokemon?.abilities?.length) return;
    const apiNames = pokemon.abilities.map(a => a.ability.name);
    Promise.allSettled(apiNames.map(n => getAbilityNames(n))).then(results => {
      const names = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') names[apiNames[i]] = r.value;
      });
      setAbilityNames(names);
    });
  }, [pokemon?.id]);

  const localNames = pokemonNamesData[String(speciesId || species?.id || pokemon.id)];
  const zhName =
    localNames?.zh ||
    species?.names?.find(n => n.language.name === 'zh-Hant')?.name ||
    species?.names?.find(n => n.language.name === 'zh-Hans')?.name ||
    pokemon.name;
  const enName =
    localNames?.en ||
    species?.names?.find(n => n.language.name === 'en')?.name ||
    pokemon.name;

  const baseName = lang === 'zh' ? zhName : enName;

  const enLabel = (() => {
    const a = pokemon.name;
    if (a.includes('-alola'))         return 'Alolan Form';
    if (a.includes('-galar'))         return 'Galarian Form';
    if (a.includes('-hisui'))         return 'Hisuian Form';
    if (a.includes('-paldea-combat')) return 'Paldean Form (Combat)';
    if (a.includes('-paldea-blaze'))  return 'Paldean Form (Blaze)';
    if (a.includes('-paldea-aqua'))   return 'Paldean Form (Aqua)';
    if (a.includes('-midnight'))      return 'Midnight Form';
    if (a.includes('-dusk'))          return 'Dusk Form';
    if (a === 'rotom-heat')  return 'Heat';
    if (a === 'rotom-wash')  return 'Wash';
    if (a === 'rotom-fan')   return 'Fan';
    if (a === 'rotom-frost') return 'Frost';
    if (a === 'rotom-mow')   return 'Mow';
    return variantLabel;
  })();
  const activeLabel = lang === 'zh' ? variantLabel : (enLabel || variantLabel);

  const megaSuffix = isMegaVariant
    ? (pokemon.name?.includes('-mega-x') ? ' X' : pokemon.name?.includes('-mega-y') ? ' Y' : '')
    : '';
  const displayName = isMegaVariant
    ? (lang === 'zh' ? `超級${baseName}${megaSuffix}` : `Mega ${baseName}${megaSuffix}`)
    : (activeLabel ? `${baseName} ${activeLabel}` : baseName);

  const spriteUrl = getSpriteUrl(pokemon);

  const normalAbilities = pokemon.abilities?.filter(a => !a.is_hidden) ?? [];
  const hiddenAbility = pokemon.abilities?.find(a => a.is_hidden);

  function abilityDisplay(apiName) {
    const cached = abilityNames[apiName];
    if (lang === 'zh' && cached?.zh) return cached.zh;
    if (cached?.en) return cached.en;
    return formatAbility(apiName);
  }

  function abilityDesc(apiName) {
    const cached = abilityNames[apiName];
    if (lang === 'zh') return cached?.zhDesc || cached?.enDesc || null;
    return cached?.enDesc || null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #334155, #1e293b)' }}
      >
        <div className="flex items-center gap-5">
          {spriteUrl && (
            <img src={spriteUrl} alt={pokemon.name}
              className="w-32 h-32 object-contain drop-shadow-lg shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white/60 text-xs mb-0.5">#{String(pokemon.id).padStart(4, '0')}</p>

            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-4xl font-black leading-tight">{displayName}</h2>
              {isMegaVariant && (
                <span className="inline-flex items-center gap-1.5 text-base font-bold bg-white/20 px-3 py-1 rounded-full">
                  <img src={MEGA_SIGIL_URL} alt="" className="h-5 w-5 shrink-0" />
                  {lang === 'zh' ? '超級進化' : 'Mega'}
                </span>
              )}
            </div>

            <p className="text-white/40 text-xs capitalize mb-3">{pokemon.name}</p>

            <div className="flex gap-2 flex-wrap mb-3">
              {pokemon.types.map(({ type }) => (
                <TypeBadge key={type.name} type={type.name} />
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {normalAbilities.map(a => {
                const desc = abilityDesc(a.ability.name);
                return (
                  <span key={a.ability.name} className="relative group">
                    <span className="text-base bg-white/20 px-3 py-1 rounded-full text-white/90 cursor-default">
                      {abilityDisplay(a.ability.name)}
                    </span>
                    {desc && (
                      <span className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900/95 text-white text-sm rounded-xl px-3 py-2 leading-relaxed hidden group-hover:block z-20 pointer-events-none shadow-xl">
                        {desc}
                      </span>
                    )}
                  </span>
                );
              })}
              {hiddenAbility && (() => {
                const desc = abilityDesc(hiddenAbility.ability.name);
                return (
                  <span className="relative group">
                    <span className="text-base bg-white/20 px-3 py-1 rounded-full text-white/90 cursor-default">
                      {abilityDisplay(hiddenAbility.ability.name)} {lang === 'zh' ? '(隱藏)' : '(Hidden)'}
                    </span>
                    {desc && (
                      <span className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900/95 text-white text-sm rounded-xl px-3 py-2 leading-relaxed hidden group-hover:block z-20 pointer-events-none shadow-xl">
                        {desc}
                      </span>
                    )}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-4 text-base font-semibold transition-colors
              ${tab === t.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {lang === 'zh' ? t.zh : t.en}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {tab === 'stats' && <BaseStats stats={pokemon.stats} />}
        {tab === 'types' && <TypeEffectiveness types={pokemon.types} horizontal />}
        {tab === 'moves' && <MoveList moves={pokemon.moves} />}
      </div>
    </div>
  );
}
