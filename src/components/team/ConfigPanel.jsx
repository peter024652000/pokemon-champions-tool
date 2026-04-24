import { useState, useEffect } from 'react';
import { useLang } from '../../context/LangContext';
import { NATURES, STAT_NAMES_ZH, TYPE_COLORS, TYPE_ICON_BASE, STAT_COLORS } from '../../utils/constants';
import { BP_MAX_PER_STAT, BP_TOTAL, calcStat } from '../../utils/calcStats';
import { fetchPokemon } from '../../utils/pokeapi';
import abilityData from '../../data/ability-data.json';
import moveData from '../../data/move-data.json';
import TypeBadge from '../TypeBadge';
import MovePicker from './MovePicker';
import NatureMatrix from './NatureMatrix';
import AbilityPicker from './AbilityPicker';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const EMPTY_BP = Object.fromEntries(STAT_ORDER.map(s => [s, 0]));
const CATEGORY_ICON_BASE = 'https://img.pokemondb.net/images/icons/move-';
const STAT_BAR_MAX = 250;

// Stat icons (text-based, matching game style)
const STAT_ICONS = {
  hp:               '♥',
  attack:           '✦',
  defense:          '✤',
  'special-attack': '◎',
  'special-defense':'◉',
  speed:            '≋',
};

function getNatureMod(statName, nature) {
  if (!nature || statName === 'hp') return 1.0;
  if (nature.increased === statName) return 1.1;
  if (nature.decreased === statName) return 0.9;
  return 1.0;
}

export default function ConfigPanel({ pokemon, initDraft, onConfirm, onCancel }) {
  const { lang } = useLang();

  const [draft, setDraft] = useState(() => initDraft || {
    selectedAbility: pokemon.abilities?.[0]?.ability?.name || null,
    nature: 'Hardy',
    bp: { ...EMPTY_BP },
    selectedMoves: [null, null, null, null],
    heldItem: '',
  });
  const [moveSlugs, setMoveSlugs] = useState([]);
  const [movePickerSlot, setMovePickerSlot] = useState(null);
  const [showNatureMatrix, setShowNatureMatrix] = useState(false);
  const [showAbilityPicker, setShowAbilityPicker] = useState(false);

  useEffect(() => {
    const tryFetch = async (apiName) => {
      const data = await fetchPokemon(apiName);
      const slugs = (data.moves || []).map(m => m.move.name).filter(s => moveData[s]);
      setMoveSlugs(slugs);
    };
    tryFetch(pokemon.apiName).catch(() => {
      if (String(pokemon.id) !== pokemon.apiName) {
        tryFetch(String(pokemon.id)).catch(() => {});
      }
    });
  }, [pokemon.apiName, pokemon.id]);

  const usedBP = Object.values(draft.bp).reduce((a, b) => a + b, 0);
  const remaining = BP_TOTAL - usedBP;

  function setBp(statName, val) {
    const parsed = isNaN(val) ? 0 : val;
    const clamped = Math.max(0, Math.min(BP_MAX_PER_STAT, parsed));
    const delta = clamped - draft.bp[statName];
    if (delta > 0 && delta > remaining) {
      const maxAllowed = draft.bp[statName] + remaining;
      setDraft(d => ({ ...d, bp: { ...d.bp, [statName]: Math.min(BP_MAX_PER_STAT, maxAllowed) } }));
      return;
    }
    setDraft(d => ({ ...d, bp: { ...d.bp, [statName]: clamped } }));
  }

  function selectMove(slotIdx, slug) {
    setDraft(d => {
      const moves = [...d.selectedMoves];
      moves[slotIdx] = slug;
      return { ...d, selectedMoves: moves };
    });
    setMovePickerSlot(null);
  }

  const currentNature = NATURES.find(n => n.en === draft.nature) || NATURES[0];
  const currentAbilityEntry = draft.selectedAbility ? abilityData[draft.selectedAbility] : null;
  const abilityName = currentAbilityEntry
    ? (lang === 'zh' ? (currentAbilityEntry.zh || currentAbilityEntry.en) : (currentAbilityEntry.en || currentAbilityEntry.zh))
    : (draft.selectedAbility || '—');

  const baseName = lang === 'zh'
    ? (pokemon.zhName || pokemon.enName || pokemon.name)
    : (pokemon.enName || pokemon.zhName || pokemon.name);
  const megaSuffix = pokemon.apiName?.includes('-mega-x') ? ' X'
    : pokemon.apiName?.includes('-mega-y') ? ' Y' : '';
  const variantLabel = lang === 'zh' ? pokemon.variantLabel : (pokemon.enLabel || pokemon.variantLabel);
  const fullName = pokemon.isMega
    ? (lang === 'zh' ? `超級${baseName}${megaSuffix}` : `Mega ${baseName}${megaSuffix}`)
    : variantLabel ? `${baseName} ${variantLabel}` : baseName;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center py-4 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <button
                  onClick={onCancel}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm font-semibold shrink-0"
                >
                  ← {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                {pokemon.sprite && (
                  <img src={pokemon.sprite} alt="" className="w-10 h-10 object-contain shrink-0" />
                )}
                <span className="font-bold text-gray-900 text-lg truncate">{fullName}</span>
                <div className="flex gap-1 flex-wrap">
                  {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="xs" />)}
                </div>
                <button
                  onClick={() => onConfirm(draft)}
                  className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shrink-0"
                >
                  {lang === 'zh' ? '確認' : 'Confirm'}
                </button>
              </div>

              {/* Main 2-column content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:divide-x divide-gray-100">

                {/* Left: BP Stats */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-700">
                      {lang === 'zh' ? '能力分配' : 'BP Allocation'}
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {usedBP} / {BP_TOTAL}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {STAT_ORDER.map(stat => {
                      const entry = pokemon.stats?.find(s => s.stat.name === stat);
                      const base = entry?.base_stat ?? 0;
                      const bp = draft.bp[stat];
                      const mod = getNatureMod(stat, currentNature);
                      const isHP = stat === 'hp';
                      const calc = base > 0 ? calcStat(base, bp, mod, isHP) : 0;
                      const barPct = Math.min((calc / STAT_BAR_MAX) * 100, 100);
                      const color = STAT_COLORS[stat] || '#9CA3AF';
                      const natureUp = !isHP && mod > 1;
                      const natureDown = !isHP && mod < 1;

                      return (
                        <div key={stat} className="flex items-center gap-1.5">
                          {/* Icon + Stat name */}
                          <div className="flex items-center gap-1 w-14 shrink-0">
                            <span className="text-xs text-gray-400">{STAT_ICONS[stat]}</span>
                            <span className={`text-xs font-medium ${
                              natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-gray-600'
                            }`}>
                              {STAT_NAMES_ZH[stat]}{natureUp ? '↑' : natureDown ? '↓' : ''}
                            </span>
                          </div>

                          {/* Calculated value */}
                          <span className={`w-9 text-sm font-mono font-bold text-right shrink-0 ${
                            natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-gray-800'
                          }`}>
                            {calc || '—'}
                          </span>

                          {/* Bar: full color when bp>0, muted when bp=0 */}
                          <div className="flex-1 bg-gray-100 rounded-full h-3 min-w-0">
                            <div
                              className="h-3 rounded-full transition-all duration-150"
                              style={{
                                width: `${barPct}%`,
                                backgroundColor: color,
                                opacity: bp > 0 ? 1 : 0.35,
                              }}
                            />
                          </div>

                          {/* BP input */}
                          <input
                            type="number"
                            min={0}
                            max={BP_MAX_PER_STAT}
                            value={bp}
                            onChange={e => setBp(stat, parseInt(e.target.value, 10))}
                            className="w-11 text-xs font-mono text-center border border-gray-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 shrink-0"
                          />

                          {/* ▲ fill remaining */}
                          <button
                            onClick={() => setBp(stat, bp + remaining)}
                            disabled={remaining <= 0 || bp >= BP_MAX_PER_STAT}
                            title={lang === 'zh' ? '加到上限' : 'Max out'}
                            className="w-6 h-6 rounded bg-blue-50 text-blue-500 hover:bg-blue-100 disabled:opacity-25 text-[10px] font-bold shrink-0 flex items-center justify-center transition-colors"
                          >▲</button>

                          {/* ✕ reset */}
                          <button
                            onClick={() => setBp(stat, 0)}
                            disabled={bp === 0}
                            title={lang === 'zh' ? '歸零' : 'Reset'}
                            className="w-6 h-6 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-25 text-[10px] font-bold shrink-0 flex items-center justify-center transition-colors"
                          >✕</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Moves */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-700">
                      {lang === 'zh' ? '招式' : 'Moves'}
                    </h3>
                    {moveSlugs.length === 0 && (
                      <span className="text-xs text-gray-300">
                        {lang === 'zh' ? '載入中...' : 'Loading...'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {[0, 1, 2, 3].map(i => {
                      const slug = draft.selectedMoves[i];
                      const d = slug ? moveData[slug] : null;
                      const moveName = d ? (lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh)) : null;
                      const color = d ? (TYPE_COLORS[d.type] || '#888') : null;

                      return (
                        <button
                          key={i}
                          onClick={() => setMovePickerSlot(i)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
                            d
                              ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                              : 'bg-gray-50 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {d ? (
                            <>
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: color }}
                              >
                                <img src={`${TYPE_ICON_BASE}${d.type}.png`} alt="" className="h-4 w-4" />
                              </span>
                              <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{moveName}</span>
                              {d.category && (
                                <img src={`${CATEGORY_ICON_BASE}${d.category}.png`} alt={d.category} className="h-4 w-auto shrink-0" />
                              )}
                              <span className="text-xs text-gray-400 shrink-0 font-mono w-5 text-right">
                                {d.pp ?? '—'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg shrink-0">+</span>
                              <span className="text-sm text-gray-400">
                                {lang === 'zh' ? `招式 ${i + 1}` : `Move ${i + 1}`}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom: Nature + Ability */}
              <div className="grid grid-cols-2 gap-3 px-4 pt-3 border-t border-gray-100">
                {/* Nature */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">
                    {lang === 'zh' ? '個性' : 'Nature'}
                  </p>
                  <button
                    onClick={() => setShowNatureMatrix(true)}
                    className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl text-left transition-all"
                  >
                    <div className="text-sm font-bold text-gray-800">
                      {lang === 'zh' ? currentNature.zh : currentNature.en}
                    </div>
                    {currentNature.increased ? (
                      <div className="text-[11px] mt-0.5">
                        <span className="text-red-500">↑{STAT_NAMES_ZH[currentNature.increased]}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-blue-500">↓{STAT_NAMES_ZH[currentNature.decreased]}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {lang === 'zh' ? '無加成' : 'Neutral'}
                      </div>
                    )}
                  </button>
                </div>

                {/* Ability */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">
                    {lang === 'zh' ? '特性' : 'Ability'}
                  </p>
                  <button
                    onClick={() => setShowAbilityPicker(true)}
                    className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl text-left transition-all"
                  >
                    <div className="text-sm font-bold text-gray-800">{abilityName}</div>
                    {currentAbilityEntry && (
                      <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                        {lang === 'zh'
                          ? (currentAbilityEntry.zhDesc || currentAbilityEntry.enDesc)
                          : currentAbilityEntry.enDesc}
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Item */}
              <div className="px-4 pt-3 pb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {lang === 'zh' ? '道具' : 'Held Item'}
                </label>
                <input
                  type="text"
                  value={draft.heldItem}
                  onChange={e => setDraft(d => ({ ...d, heldItem: e.target.value }))}
                  placeholder={lang === 'zh' ? '輸入道具名稱...' : 'Enter item name...'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {movePickerSlot !== null && (
        <MovePicker
          moveSlugs={moveSlugs}
          slotIndex={movePickerSlot}
          onSelect={slug => selectMove(movePickerSlot, slug)}
          onClose={() => setMovePickerSlot(null)}
        />
      )}

      {showNatureMatrix && (
        <NatureMatrix
          currentNature={currentNature}
          onSelect={en => setDraft(d => ({ ...d, nature: en }))}
          onClose={() => setShowNatureMatrix(false)}
        />
      )}

      {showAbilityPicker && (
        <AbilityPicker
          abilities={pokemon.abilities}
          currentAbility={draft.selectedAbility}
          onSelect={slug => setDraft(d => ({ ...d, selectedAbility: slug }))}
          onClose={() => setShowAbilityPicker(false)}
        />
      )}
    </>
  );
}
