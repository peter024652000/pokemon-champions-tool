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
import pokemonNamesData from '../data/pokemon-names.json';

const TABS = [
  { id: 'stats', label: '種族值' },
  { id: 'speed', label: '速度計算' },
  { id: 'moves', label: '招式列表' },
];

// Nature matrix constants
const STAT_AXES = ['attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const NEUTRAL_NATURE_ENS = ['Hardy', 'Docile', 'Bashful', 'Quirky', 'Serious'];
const STAT_SHORT_ZH = { attack: '攻', defense: '防', 'special-attack': '特攻', 'special-defense': '特防', speed: '速' };
const STAT_SHORT_EN = { attack: 'Atk', defense: 'Def', 'special-attack': 'SpA', 'special-defense': 'SpD', speed: 'Spe' };

function statShort(stat, lang) {
  return lang === 'zh' ? (STAT_SHORT_ZH[stat] || stat) : (STAT_SHORT_EN[stat] || stat);
}

function statLabel(statKey, lang) {
  if (lang === 'en') {
    const map = { attack: 'Atk', defense: 'Def', 'special-attack': 'Sp.Atk', 'special-defense': 'Sp.Def', speed: 'Spe' };
    return map[statKey] || statKey;
  }
  const map = { attack: '攻擊', defense: '防禦', 'special-attack': '特攻', 'special-defense': '特防', speed: '速度' };
  return map[statKey] || statKey;
}

function getNatureForCell(colIdx, rowIdx) {
  if (colIdx === rowIdx) {
    return NATURES.find(n => n.en === NEUTRAL_NATURE_ENS[rowIdx]);
  }
  // Rows = increased (直項=加), Columns = decreased (橫向=減)
  const inc = STAT_AXES[rowIdx];
  const dec = STAT_AXES[colIdx];
  return NATURES.find(n => n.increased === inc && n.decreased === dec);
}

function NatureMatrix({ nature, onChange, lang }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-[10px] border-collapse w-full">
        <thead>
          <tr>
            <th className="w-8"></th>
            {/* Columns = decreased (橫向=減) */}
            {STAT_AXES.map(s => (
              <th key={s} className="text-center font-bold text-blue-500 pb-1 px-0.5 whitespace-nowrap">
                ↓{statShort(s, lang)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Rows = increased (直項=加) */}
          {STAT_AXES.map((incStat, rowIdx) => (
            <tr key={incStat}>
              <td className="text-right font-bold text-red-500 pr-1 whitespace-nowrap">
                ↑{statShort(incStat, lang)}
              </td>
              {STAT_AXES.map((decStat, colIdx) => {
                const n = getNatureForCell(colIdx, rowIdx);
                const isNeutral = colIdx === rowIdx;
                const isSelected = n && nature.en === n.en;
                return (
                  <td key={decStat}
                    onClick={() => { if (n) onChange(n); }}
                    className={`
                      text-center cursor-pointer px-0.5 py-1 rounded transition-colors
                      ${isSelected
                        ? 'bg-blue-500 text-white font-bold'
                        : isNeutral
                        ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        : 'text-gray-700 hover:bg-blue-50'}
                    `}
                  >
                    {n ? (lang === 'zh' ? n.zh : n.en) : '?'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NatureSelector({ nature, setNature, lang }) {
  const [open, setOpen] = useState(false);

  function select(n) {
    setNature(n);
    setOpen(false);
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Summary row — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-500 shrink-0">{lang === 'zh' ? '個性' : 'Nature'}</span>
        <span className="font-bold text-gray-800">
          {lang === 'zh' ? nature.zh : nature.en}
        </span>
        {nature.increased && (
          <span className="text-red-500 font-semibold shrink-0">
            ↑{statLabel(nature.increased, lang)}
          </span>
        )}
        {nature.decreased && (
          <span className="text-blue-500 font-semibold shrink-0">
            ↓{statLabel(nature.decreased, lang)}
          </span>
        )}
        {!nature.increased && !nature.decreased && (
          <span className="text-gray-400 shrink-0">{lang === 'zh' ? '無效果' : 'Neutral'}</span>
        )}
        <span className="ml-auto text-gray-400">{open ? '▴' : '▾'}</span>
      </button>

      {/* Matrix — shown when open */}
      {open && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <NatureMatrix nature={nature} onChange={select} lang={lang} />
        </div>
      )}
    </div>
  );
}

function formatAbility(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function PokemonCard({ pokemon, species, variantLabel, isMegaVariant, speciesId }) {
  const [tab, setTab] = useState('stats');
  const [nature, setNature] = useState(NATURES[0]);
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

  const primaryType = pokemon.types[0]?.type.name;
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

  function abilityDesc(apiName) {
    const cached = abilityNames[apiName];
    if (lang === 'zh') return cached?.zhDesc || cached?.enDesc || null;
    return cached?.enDesc || null;
  }

  const showNature = tab === 'stats' || tab === 'speed'; // moves tab doesn't need nature

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header: left = sprite + info, right = type effectiveness */}
      <div
        className="p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #334155, #1e293b)' }}
      >
        <div className="flex gap-3">
          {/* Left column: sprite + name/types/abilities */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {spriteUrl && (
              <img src={spriteUrl} alt={pokemon.name}
                className="w-20 h-20 object-contain drop-shadow-lg shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white/70 text-xs">#{String(pokemon.id).padStart(4, '0')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black leading-tight">
                  {displayName}
                </h2>
                {isMegaVariant && (
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    Mega
                  </span>
                )}
              </div>
              <p className="text-white/70 text-[10px] capitalize mb-1.5">{pokemon.name}</p>
              <div className="flex gap-1.5 flex-wrap mb-1.5">
                {pokemon.types.map(({ type }) => (
                  <TypeBadge key={type.name} type={type.name} size="sm" />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {normalAbilities.map(a => {
                  const desc = abilityDesc(a.ability.name);
                  return (
                    <span key={a.ability.name} className="relative group">
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90 cursor-default">
                        {abilityDisplay(a.ability.name)}
                      </span>
                      {desc && (
                        <span className="absolute bottom-full left-0 mb-1.5 w-52 bg-gray-900/90 text-white text-xs rounded-lg px-2.5 py-1.5 leading-relaxed hidden group-hover:block z-20 pointer-events-none shadow-lg">
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
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90 cursor-default">
                        {abilityDisplay(hiddenAbility.ability.name)} {lang === 'zh' ? '(隱藏)' : '(Hidden)'}
                      </span>
                      {desc && (
                        <span className="absolute bottom-full left-0 mb-1.5 w-52 bg-gray-900/90 text-white text-xs rounded-lg px-2.5 py-1.5 leading-relaxed hidden group-hover:block z-20 pointer-events-none shadow-lg">
                          {desc}
                        </span>
                      )}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right column: type effectiveness compact */}
          <div className="shrink-0 w-36 border-l border-white/20 pl-3">
            <TypeEffectiveness types={pokemon.types} compact />
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

      {/* Nature selector — collapsible, shown for stats and speed tabs */}
      {showNature && (
        <div className="px-5 pt-4 pb-0">
          <NatureSelector nature={nature} setNature={setNature} lang={lang} />
        </div>
      )}

      {/* Tab content */}
      <div className="p-5">
        {tab === 'stats' && <BaseStats stats={pokemon.stats} nature={nature} />}
        {tab === 'speed' && <SpeedCalculator baseSpeed={baseSpeed} pokemonName={baseName} nature={nature} />}
        {tab === 'moves' && <MoveList moves={pokemon.moves} />}
      </div>
    </div>
  );
}
