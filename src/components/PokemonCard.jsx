import { useState } from 'react';
import TypeBadge from './TypeBadge';
import BaseStats from './BaseStats';
import TypeEffectiveness from './TypeEffectiveness';
import SpeedCalculator from './SpeedCalculator';
import MoveList from './MoveList';
import { getSpriteUrl } from '../utils/pokeapi';
import { TYPE_COLORS, NATURES } from '../utils/constants';

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
  const [nature, setNature] = useState(NATURES[0]); // default: Hardy (neutral)

  const zhName =
    species?.names?.find(n => n.language.name === 'zh-Hant')?.name ||
    species?.names?.find(n => n.language.name === 'zh-Hans')?.name ||
    pokemon.name;

  // For non-mega variants, append label to name
  const displayName = variantLabel && !isMegaVariant
    ? `${zhName} ${variantLabel}`
    : zhName;

  const primaryType = pokemon.types[0]?.type.name;
  const headerColor = TYPE_COLORS[primaryType] || '#6390F0';
  const spriteUrl = getSpriteUrl(pokemon);
  const baseSpeed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0;

  const normalAbilities = pokemon.abilities?.filter(a => !a.is_hidden) ?? [];
  const hiddenAbility = pokemon.abilities?.find(a => a.is_hidden);

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
                {isMegaVariant && variantLabel ? zhName : displayName}
              </h2>
              {isMegaVariant && variantLabel && (
                <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  {variantLabel}
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
                  {formatAbility(a.ability.name)}
                </span>
              ))}
              {hiddenAbility && (
                <span className="text-xs bg-white/10 border border-white/30 px-2 py-0.5 rounded-full text-white/70 italic">
                  {formatAbility(hiddenAbility.ability.name)} (隱藏)
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
            <span className="text-xs font-semibold text-gray-500 shrink-0">個性</span>
            <select
              value={nature.en}
              onChange={e => setNature(NATURES.find(n => n.en === e.target.value))}
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-700"
            >
              {NATURES.map(n => (
                <option key={n.en} value={n.en}>
                  {n.zh}（{n.en}）
                </option>
              ))}
            </select>
            {nature.increased && (
              <span className="text-xs text-red-500 font-semibold shrink-0">
                ↑{nature.increased.replace('special-attack','特攻').replace('special-defense','特防').replace('attack','攻擊').replace('defense','防禦').replace('speed','速度')}
              </span>
            )}
            {nature.decreased && (
              <span className="text-xs text-blue-500 font-semibold shrink-0">
                ↓{nature.decreased.replace('special-attack','特攻').replace('special-defense','特防').replace('attack','攻擊').replace('defense','防禦').replace('speed','速度')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="p-5">
        {tab === 'stats' && <BaseStats stats={pokemon.stats} nature={nature} />}
        {tab === 'speed' && <SpeedCalculator baseSpeed={baseSpeed} pokemonName={zhName} nature={nature} />}
        {tab === 'type'  && <TypeEffectiveness types={pokemon.types} />}
        {tab === 'moves' && <MoveList moves={pokemon.moves} />}
      </div>
    </div>
  );
}
