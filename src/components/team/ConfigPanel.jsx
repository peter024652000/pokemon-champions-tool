import { useState, useEffect, useMemo } from 'react';
import { useLang } from '../../context/LangContext';
import { NATURES, STAT_NAMES_ZH, TYPE_COLORS, TYPE_NAMES_ZH, TYPE_ICON_BASE, STAT_COLORS, ALL_TYPES } from '../../utils/constants';
import { BP_MAX_PER_STAT, BP_TOTAL, calcStat } from '../../utils/calcStats';
import { fetchPokemon } from '../../utils/pokeapi';
import abilityData from '../../data/ability-data.json';
import moveData from '../../data/move-data.json';
import TypeBadge from '../TypeBadge';
import NatureMatrix from './NatureMatrix';
import AbilityPicker from './AbilityPicker';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const EMPTY_BP = Object.fromEntries(STAT_ORDER.map(s => [s, 0]));
const CATEGORY_ICON_BASE = 'https://img.pokemondb.net/images/icons/move-';
const STAT_BAR_MAX = 250;
const CATEGORIES = ['physical', 'special', 'status'];
const CATEGORY_LABEL = {
  physical: { zh: '物理', en: 'Physical' },
  special:  { zh: '特殊', en: 'Special'  },
  status:   { zh: '變化', en: 'Status'   },
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

  const [moveSearch, setMoveSearch] = useState('');
  const [moveTypeFilter, setMoveTypeFilter] = useState(null);
  const [moveCatFilter, setMoveCatFilter] = useState(null);

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

  function openMovePicker(slot) {
    setMovePickerSlot(slot);
    setMoveSearch('');
    setMoveTypeFilter(null);
    setMoveCatFilter(null);
  }

  const sortedMoves = useMemo(() => {
    return moveSlugs
      .filter(slug => moveData[slug])
      .sort((a, b) => ALL_TYPES.indexOf(moveData[a]?.type) - ALL_TYPES.indexOf(moveData[b]?.type));
  }, [moveSlugs]);

  const filteredMoves = useMemo(() => {
    return sortedMoves.filter(slug => {
      const d = moveData[slug];
      if (moveTypeFilter && d.type !== moveTypeFilter) return false;
      if (moveCatFilter && d.category !== moveCatFilter) return false;
      if (moveSearch) {
        const q = moveSearch.toLowerCase();
        if (!(d.zh || '').includes(q) && !(d.en || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sortedMoves, moveTypeFilter, moveCatFilter, moveSearch]);

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

  function selectMove(slug) {
    setDraft(d => {
      const moves = [...d.selectedMoves];
      moves[movePickerSlot] = slug;
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center sm:p-4"
        onClick={onCancel}
      >
        {/* Modal — full-screen on mobile, fixed-size card on desktop */}
        <div
          className="bg-white sm:rounded-[16px] overflow-hidden shadow-clay-md w-full sm:max-w-3xl flex flex-col relative h-screen sm:h-[680px] sm:max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* ✕ Close */}
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-clay-oat hover:bg-clay-border/50 text-clay-silver hover:text-clay-charcoal flex items-center justify-center text-sm transition-colors z-10"
          >✕</button>

          {/* Header — always visible, same height on both screens */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-clay-border pr-12 shrink-0">
            {pokemon.sprite && (
              <img src={pokemon.sprite} alt="" className="w-11 h-11 object-contain shrink-0" />
            )}
            <span className="font-bold text-clay-charcoal text-lg truncate">{fullName}</span>
            <div className="flex gap-1 flex-wrap">
              {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="xs" />)}
            </div>
          </div>

          {/* Sliding body */}
          <div className="relative overflow-hidden flex-1 min-h-0">

            {/* ── Screen A: Config ── */}
            <div className={`absolute inset-0 flex flex-col transition-transform duration-200 ${
              movePickerSlot !== null ? '-translate-x-full' : 'translate-x-0'
            }`}>

              {/* Top: BP (left) + Moves (right) */}
              <div className="overflow-y-auto sm:overflow-hidden sm:flex-1 sm:min-h-0 flex flex-col sm:flex-row sm:divide-x divide-clay-border">

                {/* Left: BP allocation */}
                <div className="p-4 sm:flex-1 sm:overflow-y-auto sm:flex sm:flex-col sm:justify-center">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-clay-charcoal uppercase tracking-wide">
                      {lang === 'zh' ? '能力分配' : 'BP Allocation'}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-clay-oat text-clay-silver'
                    }`}>
                      {usedBP} / {BP_TOTAL}
                    </span>
                  </div>

                  <div className="space-y-1.5">
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
                          <span className={`text-xs font-medium w-9 text-right shrink-0 ${
                            natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-clay-silver'
                          }`}>
                            {STAT_NAMES_ZH[stat]}{natureUp ? '↑' : natureDown ? '↓' : ''}
                          </span>
                          <span className={`w-8 text-xs font-mono font-bold text-right shrink-0 ${
                            natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-clay-charcoal'
                          }`}>
                            {calc || '—'}
                          </span>
                          <div className="flex-1 bg-clay-border/30 rounded-full h-2 min-w-0">
                            <div
                              className="h-2 rounded-full transition-all duration-150"
                              style={{ width: `${barPct}%`, backgroundColor: color }}
                            />
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={BP_MAX_PER_STAT}
                            value={bp}
                            onChange={e => setBp(stat, parseInt(e.target.value, 10))}
                            className="w-9 text-xs font-mono text-center border border-clay-border rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-clay-blue/30 shrink-0"
                          />
                          <button
                            onClick={() => setBp(stat, bp + remaining)}
                            disabled={remaining <= 0 || bp >= BP_MAX_PER_STAT}
                            title={lang === 'zh' ? '加到上限' : 'Max out'}
                            className="w-5 h-5 rounded bg-clay-blue-light text-clay-blue hover:bg-clay-blue-mid disabled:opacity-25 text-[9px] font-bold shrink-0 flex items-center justify-center transition-colors"
                          >▲</button>
                          <button
                            onClick={() => setBp(stat, 0)}
                            disabled={bp === 0}
                            title={lang === 'zh' ? '歸零' : 'Reset'}
                            className="w-5 h-5 rounded bg-clay-oat text-clay-silver hover:bg-clay-border/50 disabled:opacity-25 text-[9px] font-bold shrink-0 flex items-center justify-center transition-colors"
                          >✕</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Move slots */}
                <div className="p-4 border-t sm:border-t-0 border-clay-border sm:flex-1 sm:overflow-y-auto sm:flex sm:flex-col sm:justify-center">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-clay-charcoal uppercase tracking-wide">
                      {lang === 'zh' ? '招式' : 'Moves'}
                    </h3>
                    {moveSlugs.length === 0 && (
                      <span className="text-xs text-clay-silver animate-pulse">
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
                          onClick={() => openMovePicker(i)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-[12px] border transition-all text-left ${
                            d
                              ? 'bg-white border-clay-border hover:border-clay-blue/40 hover:shadow-clay'
                              : 'bg-clay-oat border-dashed border-clay-border hover:border-clay-blue/50 hover:bg-clay-blue-light'
                          }`}
                        >
                          {d ? (
                            <>
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: color }}
                              >
                                <img src={`${TYPE_ICON_BASE}${d.type}.png`} alt="" className="h-3.5 w-3.5" />
                              </span>
                              <span className="flex-1 text-sm font-semibold text-clay-charcoal truncate min-w-0">{moveName}</span>
                              {d.category && (
                                <img src={`${CATEGORY_ICON_BASE}${d.category}.png`} alt={d.category} className="h-4 w-auto shrink-0" />
                              )}
                              <span className="text-xs text-clay-silver shrink-0 font-mono w-5 text-right">{d.pp ?? '—'}</span>
                            </>
                          ) : (
                            <>
                              {/* + circle — border-dashed for consistent alignment */}
                              <span className="w-7 h-7 rounded-full border-2 border-dashed border-clay-border/60 flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-clay-border" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M8 3v10M3 8h10"/>
                                </svg>
                              </span>
                              <span className="text-sm text-clay-silver">
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

              {/* Bottom: Row 1 (Nature + Ability) + Row 2 (Held Item) — always visible, no scroll */}
              <div className="shrink-0 border-t border-clay-border px-4 py-3 space-y-2">

                {/* Row 1: Nature | Ability */}
                <div className="grid grid-cols-2 gap-2">

                  {/* Nature */}
                  <div>
                    <p className="text-[10px] font-semibold text-clay-silver mb-1">
                      {lang === 'zh' ? '個性' : 'Nature'}
                    </p>
                    <button
                      onClick={() => setShowNatureMatrix(true)}
                      className="w-full px-2.5 py-2.5 bg-clay-oat hover:bg-clay-border/40 border border-clay-border rounded-[12px] text-left transition-all"
                    >
                      <div className="text-xs font-bold text-clay-charcoal truncate">
                        {lang === 'zh' ? currentNature.zh : currentNature.en}
                      </div>
                      {currentNature.increased ? (
                        <div className="text-[10px] mt-0.5 space-x-1">
                          <span className="text-red-500">↑{STAT_NAMES_ZH[currentNature.increased]}</span>
                          <span className="text-blue-500">↓{STAT_NAMES_ZH[currentNature.decreased]}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-clay-silver mt-0.5">{lang === 'zh' ? '無加成' : 'Neutral'}</div>
                      )}
                    </button>
                  </div>

                  {/* Ability */}
                  <div>
                    <p className="text-[10px] font-semibold text-clay-silver mb-1">
                      {lang === 'zh' ? '特性' : 'Ability'}
                    </p>
                    <button
                      onClick={() => setShowAbilityPicker(true)}
                      className="w-full px-2.5 py-2.5 bg-clay-oat hover:bg-clay-border/40 border border-clay-border rounded-[12px] text-left transition-all"
                    >
                      <div className="text-xs font-bold text-clay-charcoal truncate">{abilityName}</div>
                      {currentAbilityEntry && (
                        <div className="text-[10px] text-clay-silver mt-0.5 line-clamp-1">
                          {lang === 'zh'
                            ? (currentAbilityEntry.zhDesc || currentAbilityEntry.enDesc)
                            : currentAbilityEntry.enDesc}
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Row 2: Held Item — full width */}
                <div>
                  <p className="text-[10px] font-semibold text-clay-silver mb-1">
                    {lang === 'zh' ? '持有物' : 'Held Item'}
                  </p>
                  <input
                    type="text"
                    value={draft.heldItem}
                    onChange={e => setDraft(d => ({ ...d, heldItem: e.target.value }))}
                    placeholder={lang === 'zh' ? '輸入持有物...' : 'Held item name...'}
                    className="w-full border border-clay-border rounded-[12px] px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
                  />
                </div>
              </div>
            </div>

            {/* ── Screen B: Inline Move Picker ── */}
            <div className={`absolute inset-0 flex flex-col bg-white transition-transform duration-200 ${
              movePickerSlot !== null ? 'translate-x-0' : 'translate-x-full'
            }`}>

              {/* Back header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-clay-border shrink-0">
                <button
                  onClick={() => setMovePickerSlot(null)}
                  className="text-clay-silver hover:text-clay-charcoal font-semibold flex items-center gap-1 shrink-0 transition-colors text-sm"
                >
                  ←
                </button>
                <span className="font-semibold text-clay-charcoal text-sm">
                  {lang === 'zh'
                    ? `選擇招式 ${movePickerSlot !== null ? movePickerSlot + 1 : ''}`
                    : `Select Move ${movePickerSlot !== null ? movePickerSlot + 1 : ''}`}
                </span>
                <span className="text-xs text-clay-silver ml-auto">{filteredMoves.length}</span>
              </div>

              {/* Filters */}
              <div className="px-4 py-2.5 space-y-2 border-b border-clay-border shrink-0">
                <input
                  type="text"
                  value={moveSearch}
                  onChange={e => setMoveSearch(e.target.value)}
                  placeholder={lang === 'zh' ? '搜尋招式...' : 'Search move...'}
                  className="w-full border border-clay-border rounded-[12px] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
                />

                {/* Type filter */}
                <div className="flex gap-1 flex-wrap items-center">
                  {moveTypeFilter && (
                    <button
                      onClick={() => setMoveTypeFilter(null)}
                      className="text-xs text-clay-silver hover:text-clay-charcoal px-2 py-0.5 rounded border border-clay-border shrink-0 transition-colors"
                    >
                      {lang === 'zh' ? '清除' : 'Clear'}
                    </button>
                  )}
                  {ALL_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setMoveTypeFilter(moveTypeFilter === t ? null : t)}
                      title={lang === 'zh' ? TYPE_NAMES_ZH[t] : t}
                      className={`rounded-full transition-all overflow-hidden flex items-center justify-center ${
                        moveTypeFilter === t ? 'ring-2 ring-offset-1 ring-clay-charcoal scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ width: 24, height: 24, backgroundColor: TYPE_COLORS[t] }}
                    >
                      <img src={`${TYPE_ICON_BASE}${t}.png`} alt="" className="h-3 w-3" />
                    </button>
                  ))}
                </div>

                {/* Category filter */}
                <div className="flex gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMoveCatFilter(moveCatFilter === cat ? null : cat)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold transition-all ${
                        moveCatFilter === cat
                          ? 'bg-clay-border text-clay-charcoal border-clay-border shadow-clay'
                          : 'bg-white border-clay-border text-clay-silver hover:text-clay-charcoal'
                      }`}
                    >
                      <img src={`${CATEGORY_ICON_BASE}${cat}.png`} alt={cat} className="h-3.5 w-auto" />
                      {CATEGORY_LABEL[cat][lang === 'zh' ? 'zh' : 'en']}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column headers */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-clay-oat border-b border-clay-border shrink-0">
                <span className="w-20 shrink-0 text-[10px] font-semibold text-clay-silver uppercase tracking-wide">
                  {lang === 'zh' ? '屬性' : 'Type'}
                </span>
                <span className="w-8 sm:w-9 shrink-0 text-[10px] font-semibold text-clay-silver uppercase tracking-wide text-center">
                  {lang === 'zh' ? '類' : 'Cat'}
                </span>
                <span className="flex-1 text-[10px] font-semibold text-clay-silver uppercase tracking-wide">
                  {lang === 'zh' ? '招式名稱' : 'Move'}
                </span>
                <span className="w-10 sm:w-14 text-right text-[10px] font-semibold text-clay-silver uppercase tracking-wide shrink-0">
                  {lang === 'zh' ? '威力' : 'PWR'}
                </span>
                <span className="w-12 sm:w-16 text-right text-[10px] font-semibold text-clay-silver uppercase tracking-wide shrink-0">
                  {lang === 'zh' ? '命中' : 'ACC'}
                </span>
              </div>

              {/* Move list */}
              <div className="flex-1 overflow-y-auto">
                <button
                  onClick={() => selectMove(null)}
                  className="w-full px-4 py-2 text-sm text-clay-silver hover:bg-clay-oat text-left border-b border-clay-border/40 transition-colors"
                >
                  {lang === 'zh' ? '— 移除招式 —' : '— Remove move —'}
                </button>

                {filteredMoves.map(slug => {
                  const d = moveData[slug];
                  const name = lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh);

                  return (
                    <button
                      key={slug}
                      onClick={() => selectMove(slug)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-clay-blue-light text-left transition-colors border-b border-clay-border/20"
                    >
                      {/* Type badge — w-20 matches header, fits all English type names */}
                      <span className="w-20 shrink-0">
                        <TypeBadge type={d.type} size="xs" />
                      </span>
                      {/* Category icon */}
                      <span className="w-8 sm:w-9 shrink-0 flex items-center justify-center">
                        <img src={`${CATEGORY_ICON_BASE}${d.category}.png`} alt={d.category} className="h-3.5 w-auto" />
                      </span>
                      {/* Move name — takes all remaining space, power/acc fixed on right */}
                      <span className="text-sm text-clay-charcoal font-medium flex-1 min-w-0 truncate">{name}</span>
                      {/* Power */}
                      <span className="w-10 sm:w-14 text-right text-xs font-mono text-clay-charcoal shrink-0">{d.power ?? '—'}</span>
                      {/* Accuracy */}
                      <span className="w-12 sm:w-16 text-right text-xs font-mono text-clay-silver shrink-0">
                        {d.accuracy != null ? `${d.accuracy}%` : '—'}
                      </span>
                    </button>
                  );
                })}

                {filteredMoves.length === 0 && (
                  <div className="text-center py-12 text-clay-silver text-sm">
                    {lang === 'zh' ? '沒有符合條件的招式' : 'No moves found'}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer — always rendered to maintain consistent modal height */}
          <div className="px-5 py-3 border-t border-clay-border flex justify-center shrink-0">
            {movePickerSlot === null ? (
              <button
                onClick={() => onConfirm(draft)}
                className="px-12 py-2 bg-clay-blue hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity shadow-clay"
              >
                {lang === 'zh' ? '確認' : 'Confirm'}
              </button>
            ) : (
              <div className="h-9" />
            )}
          </div>

        </div>
      </div>

      {/* Sub-modals */}
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
