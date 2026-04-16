import { useState, useEffect } from 'react';
import TypeBadge from './TypeBadge';
import BaseStats from './BaseStats';
import TypeEffectiveness from './TypeEffectiveness';
import SpeedCalculator from './SpeedCalculator';
import MoveList from './MoveList';
import { getSpriteUrl } from '../utils/pokeapi';
import { TYPE_COLORS, NATURES } from '../utils/constants';
import { getAbilityNames } from '../utils/abilityCache';
import { useLang } from '../context/LangContext';

const TABS = [
  { id: 'stats', label: '種族值' },
  { id: 'speed', label: '速度計算' },
  { id: 'type',  label: '屬性相剋' },
  { id: 'moves', label: '招式列表' },
];

function formatAbility(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function PokemonCard({ pokemon, species, variantLabel, isMegaVariant }) {
  const [tab, setTab] = useState('stats');
  const [nature, setNature] = useState(NATURES[0]);
  const [abilityNames, setAbilityNames] = useState({});
  const { lang } = useLang();

  // Fetch ability names for language display
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

  const zhName =
    species?.names?.find(n => n.language.name === 'zh-Hant')?.name ||
    species?.names?.find(n => n.language.name === 'zh-Hans')?.name ||
    pokemon.name;
  const enName =
    species?.names?.find(n => n.language.name === 'en')?.name ||
    pokemon.name;

  const baseName = lang === 'zh' ? zhName : enName;

  // Variant label by language
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

  // For non-mega variants, append label to name
  const displayName = activeLabel && !isMegaVariant
    ? `${baseName} ${activeLabel}`
    : baseName;

  const primaryType = pokemon.types[0]?.type.name;
  const headerColor = TYPE_COLORS[primaryType] || '#6390F0';
  const spriteUrl = getSpriteUrl(pokemon);
  const baseSpeed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0;

  const normalAbilities = pokemon.abilities?.filter(a => !a.is_hidden) ?? [];
  const hiddenAbility = pokemon.abilities?.find(a => a.is_hidden);

  function abilityDisplay(apiName) {
    const cached = abilityNames[apiName];
    if (lang === 'zh' && cached?.zh) return cached.zh;
    if (cached?.en) return cached.en;
    return formatAbility(apiName);
  }

  const showNature = tab === 'stats' || tab === 'speed';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${headerColor}cc, ${headerColor})` }}
      >
        <div className="flex items-center gap-4">
          {spriteUrl && (
            <img src={spriteUrl} alt={pokemon.name}
              className="w-24 h-24 object-contain drop-shadow-lg shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white/70 text-xs">#{String(pokemon.id).padStart(4, '0')}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-3xl font-black leading-tight">
                {isMegaVariant && activeLabel ? baseName : displayName}
              </h2>
              {isMegaVariant && activeLabel && (
                <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  {activeLabel}
                </span>
              )}
            </div>
            <p className="text-white/70 text-xs capitalize mb-2">{pokemon.name}</p>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {pokemon.types.map(({ type }) => (
                <TypeBadge key={type.name} type={type.name} />
              ))}
            </div>
            {/* Abilities */}
            <div className="flex flex-wrap gap-1.5">
              {normalAbilities.map(a => (
                <span key={a.ability.name}
                  className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                  {abilityDisplay(a.ability.name)}
                </span>
              ))}
              {hiddenAbility && (
                <span className="text-xs bg-white/10 border border-white/30 px-2 py-0.5 rounded-full text-white/70 italic">
                  {abilityDisplay(hiddenAbility.ability.name)} {lang === 'zh' ? '(隱藏)' : '(Hidden)'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors
              ${tab === t.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Nature selector — shown for stats and speed tabs */}
      {showNature && (
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 shrink-0">
              {lang === 'zh' ? '個性' : 'Nature'}
            </span>
            <select
              value={nature.en}
              onChange={e => setNature(NATURES.find(n => n.en === e.target.value))}
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-700"
            >
              {NATURES.map(n => (
                <option key={n.en} value={n.en}>
                  {lang === 'zh' ? `${n.zh}（${n.en}）` : n.en}
                </option>
              ))}
            </select>
            {nature.increased && (
              <span className="text-xs text-red-500 font-semibold shrink-0">
                ↑{statLabel(nature.increased, lang)}
              </span>
            )}
            {nature.decreased && (
              <span className="text-xs text-blue-500 font-semibold shrink-0">
                ↓{statLabel(nature.decreased, lang)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="p-5">
        {tab === 'stats' && <BaseStats stats={pokemon.stats} nature={nature} />}
        {tab === 'speed' && <SpeedCalculator baseSpeed={baseSpeed} pokemonName={baseName} nature={nature} />}
        {tab === 'type'  && <TypeEffectiveness types={pokemon.types} />}
        {tab === 'moves' && <MoveList moves={pokemon.moves} />}
      </div>
    </div>
  );
}

function statLabel(statKey, lang) {
  if (lang === 'en') {
    const map = {
      'attack': 'Atk', 'defense': 'Def',
      'special-attack': 'Sp.Atk', 'special-defense': 'Sp.Def', 'speed': 'Spe',
    };
    return map[statKey] || statKey;
  }
  const map = {
    'attack': '攻擊', 'defense': '防禦',
    'special-attack': '特攻', 'special-defense': '特防', 'speed': '速度',
  };
  return map[statKey] || statKey;
}
