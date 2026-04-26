import { useState, useEffect, useMemo, useRef } from 'react';
import { useLang } from '../../context/LangContext';
import { NATURES, STAT_NAMES_ZH, TYPE_COLORS, TYPE_NAMES_ZH, TYPE_ICON_BASE, STAT_COLORS, ALL_TYPES, ITEM_SPRITE_BASE } from '../../utils/constants';
import { BP_MAX_PER_STAT, BP_TOTAL, calcStat } from '../../utils/calcStats';
import { fetchPokemon } from '../../utils/pokeapi';
import abilityData from '../../data/ability-data.json';
import moveData from '../../data/move-data.json';
import itemData from '../../data/item-data.json';
import TypeBadge from '../TypeBadge';
import NatureMatrix from './NatureMatrix';
import AbilityPicker from './AbilityPicker';
import { useBuilds } from '../../hooks/useBuilds';

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
const ITEM_CATEGORIES = ['RECOVERY', 'POWER_BOOST', 'STAT_BOOST', 'BERRY', 'MEGA_STONE', 'OTHER'];
const ITEM_CATEGORY_LABEL = {
  RECOVERY:   { zh: '回復', en: 'Recovery' },
  POWER_BOOST:{ zh: '攻強', en: 'Power'    },
  STAT_BOOST: { zh: '能力', en: 'Stat'     },
  BERRY:      { zh: '果子', en: 'Berry'    },
  MEGA_STONE: { zh: '進化石', en: 'Mega'   },
  OTHER:      { zh: '其他', en: 'Other'    },
};

const SEREBII_ITEM_BASE = 'https://www.serebii.net/itemdex/sprites/';

function ItemSprite({ slug, category, className = 'w-6 h-6' }) {
  const [src, setSrc] = useState(`${ITEM_SPRITE_BASE}${slug}.png`);
  const [failed, setFailed] = useState(false);

  function handleError() {
    if (src.startsWith(ITEM_SPRITE_BASE)) {
      setSrc(`${SEREBII_ITEM_BASE}${slug}.png`);
    } else {
      setFailed(true);
    }
  }

  if (failed) {
    if (category === 'MEGA_STONE') {
      return <img src={MEGA_SIGIL_URL} alt="" className={`${className} object-contain shrink-0 opacity-60`} />;
    }
    return <span className={`${className} shrink-0 rounded bg-clay-border/30 flex items-center justify-center text-[9px] text-clay-silver`}>?</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className={`${className} object-contain shrink-0`}
      onError={handleError}
    />
  );
}

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
  const [moveTypeFilter, setMoveTypeFilter] = useState(() => new Set());
  const [moveCatFilter, setMoveCatFilter] = useState(null);
  const [moveTooltip, setMoveTooltip] = useState(null);

  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemCatFilter, setItemCatFilter] = useState(null);
  const [itemTooltip, setItemTooltip] = useState(null);

  const [showBuilds, setShowBuilds] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveToast, setSaveToast] = useState('');
  const [activeBuildId, setActiveBuildId] = useState(null);
  const [editingBuildId, setEditingBuildId] = useState(null);
  const [editingBuildName, setEditingBuildName] = useState('');
  const isComposing = useRef(false);

  const { builds, saveBuild, updateBuild, renameBuild, deleteBuild } = useBuilds(pokemon.apiName);

  function commitRename() {
    if (editingBuildName.trim()) renameBuild(editingBuildId, editingBuildName.trim());
    setEditingBuildId(null);
    setEditingBuildName('');
  }

  function showToast(msg) {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 2000);
  }

  function doSaveBuild() {
    if (!saveName.trim()) return;
    saveBuild(saveName.trim(), draft);
    setShowSaveInput(false);
    setSaveName('');
    showToast(lang === 'zh' ? '✓ 配置已儲存' : '✓ Build saved');
  }

  function doUpdateBuild() {
    updateBuild(activeBuildId, draft);
    showToast(lang === 'zh' ? '✓ 配置已更新' : '✓ Build updated');
  }

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
    setMoveTypeFilter(new Set());
    setMoveCatFilter(null);
    setMoveTooltip(null);
  }

  const sortedMoves = useMemo(() => {
    return moveSlugs
      .filter(slug => moveData[slug])
      .sort((a, b) => ALL_TYPES.indexOf(moveData[a]?.type) - ALL_TYPES.indexOf(moveData[b]?.type));
  }, [moveSlugs]);

  const filteredMoves = useMemo(() => {
    return sortedMoves.filter(slug => {
      const d = moveData[slug];
      if (moveTypeFilter.size > 0 && !moveTypeFilter.has(d?.type)) return false;
      if (moveCatFilter && d?.category !== moveCatFilter) return false;
      if (moveSearch) {
        const q = moveSearch.toLowerCase();
        if (!(d.zh || '').includes(q) && !(d.en || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sortedMoves, moveTypeFilter, moveCatFilter, moveSearch]);

  const availableMoveTypes = useMemo(
    () => ALL_TYPES.filter(t => sortedMoves.some(s => moveData[s]?.type === t)),
    [sortedMoves]
  );
  const availableMoveCats = useMemo(
    () => CATEGORIES.filter(c => sortedMoves.some(s => moveData[s]?.category === c)),
    [sortedMoves]
  );
  function isMoveTypeDisabled(type) {
    if (!moveCatFilter) return false;
    return !sortedMoves.some(s => moveData[s]?.type === type && moveData[s]?.category === moveCatFilter);
  }
  function isMoveCatDisabled(cat) {
    if (moveTypeFilter.size === 0) return false;
    return !sortedMoves.some(s => moveTypeFilter.has(moveData[s]?.type) && moveData[s]?.category === cat);
  }
  function getMoveEffectText(slug) {
    const d = moveData[slug];
    if (!d) return null;
    return lang === 'zh' ? (d.zhEffect || d.enEffect || null) : (d.enEffect || d.zhEffect || null);
  }

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
          {/* Save toast */}
          {saveToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-clay-charcoal text-white text-xs font-semibold px-4 py-2 rounded-full shadow-clay-md z-20 pointer-events-none whitespace-nowrap">
              {saveToast}
            </div>
          )}

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
              {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="sm" />)}
            </div>
          </div>

          {/* Builds banner — shown when saved builds exist */}
          {builds.length > 0 && (
            <button
              onClick={() => setShowBuilds(true)}
              className="w-full px-4 py-1.5 bg-clay-blue-light text-clay-blue text-xs font-semibold flex items-center justify-center gap-1.5 border-b border-clay-border hover:bg-clay-blue-mid/40 transition-colors shrink-0"
            >
              <span>⬇</span>
              <span>
                {lang === 'zh'
                  ? `${builds.length} 個已存配置`
                  : `${builds.length} saved build${builds.length > 1 ? 's' : ''}`}
              </span>
            </button>
          )}

          {/* Sliding body */}
          <div className="relative overflow-hidden flex-1 min-h-0">

            {/* ── Screen A: Config ── */}
            <div className={`absolute inset-0 flex flex-col transition-transform duration-200 ${
              movePickerSlot !== null || showBuilds || showItemPicker ? '-translate-x-full' : 'translate-x-0'
            }`}>

              {/* Top: BP (left) + Moves (right) */}
              <div className="overflow-y-auto flex flex-col sm:flex-row sm:divide-x divide-clay-border">

                {/* Left: BP allocation */}
                <div className="p-4 sm:flex-1 sm:overflow-y-auto sm:flex sm:flex-col">
                  <div className="flex items-center justify-between mb-2.5 shrink-0">
                    <h3 className="text-sm font-bold text-clay-charcoal">
                      {lang === 'zh' ? '能力分配' : 'BP Allocation'}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-clay-oat text-clay-silver'
                    }`}>
                      {usedBP} / {BP_TOTAL}
                    </span>
                  </div>

                  <div className="space-y-3 sm:my-auto">
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
                <div className="p-4 border-t sm:border-t-0 border-clay-border sm:flex-1 sm:overflow-y-auto">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-sm font-bold text-clay-charcoal">
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
                          className={`w-full flex items-center gap-2 px-3 py-3 rounded-[12px] border transition-all text-left ${
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

              {/* Bottom: takes all remaining space; whitespace split inside via flex-1 spacers */}
              <div className="flex-1 flex flex-col border-t border-clay-border px-4 min-h-0">

                {/* Space above content */}
                <div className="flex-1" />

                {/* Content */}
                <div className="space-y-3 py-2">

                  {/* Row 1: Nature | Ability — equal height via flex-col + flex-1 on buttons */}
                  <div className="grid grid-cols-2 gap-2 items-stretch">

                    {/* Nature */}
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-clay-charcoal mb-1">
                        {lang === 'zh' ? '個性' : 'Nature'}
                      </p>
                      <button
                        onClick={() => setShowNatureMatrix(true)}
                        className="flex-1 w-full px-3 py-2.5 bg-clay-oat hover:bg-clay-border/40 border border-clay-border rounded-[12px] text-left transition-all"
                      >
                        <div className="text-sm font-medium text-clay-charcoal truncate leading-tight">
                          {lang === 'zh' ? currentNature.zh : currentNature.en}
                        </div>
                        {currentNature.increased ? (
                          <div className="text-xs font-medium mt-1 space-x-1.5">
                            <span className="text-red-500">↑{STAT_NAMES_ZH[currentNature.increased]}</span>
                            <span className="text-blue-500">↓{STAT_NAMES_ZH[currentNature.decreased]}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-clay-border mt-1">{lang === 'zh' ? '無加成' : 'Neutral'}</div>
                        )}
                      </button>
                    </div>

                    {/* Ability */}
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-clay-charcoal mb-1">
                        {lang === 'zh' ? '特性' : 'Ability'}
                      </p>
                      <button
                        onClick={() => setShowAbilityPicker(true)}
                        className="flex-1 w-full px-3 py-2.5 bg-clay-oat hover:bg-clay-border/40 border border-clay-border rounded-[12px] text-left transition-all"
                      >
                        <div className="text-sm font-medium text-clay-charcoal truncate leading-tight">{abilityName}</div>
                        {currentAbilityEntry && (
                          <div className="text-xs text-clay-silver mt-1 line-clamp-2 leading-relaxed">
                            {lang === 'zh'
                              ? (currentAbilityEntry.zhDesc || currentAbilityEntry.enDesc)
                              : currentAbilityEntry.enDesc}
                          </div>
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Row 2: Held Item — full width, clearly separated from row 1 */}
                  <div className="border-t border-clay-border/50 pt-3">
                    <p className="text-sm font-bold text-clay-charcoal mb-1">
                      {lang === 'zh' ? '持有物' : 'Held Item'}
                    </p>
                    <button
                      onClick={() => { setItemSearch(''); setItemCatFilter(null); setShowItemPicker(true); }}
                      className={`w-full flex items-center gap-2 px-3 py-3 border border-clay-border rounded-[12px] text-left transition-all ${
                        draft.heldItem && itemData[draft.heldItem]
                          ? 'bg-white hover:border-clay-blue/40'
                          : 'bg-clay-oat hover:border-clay-blue/50 hover:bg-clay-blue-light'
                      }`}
                    >
                      {draft.heldItem && itemData[draft.heldItem] ? (
                        <>
                          <ItemSprite slug={draft.heldItem} category={itemData[draft.heldItem].category} className="w-5 h-5" />
                          <span className="flex-1 text-sm font-semibold text-clay-charcoal truncate">
                            {lang === 'zh' ? (itemData[draft.heldItem].zh || itemData[draft.heldItem].en) : (itemData[draft.heldItem].en || itemData[draft.heldItem].zh)}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); setDraft(d => ({ ...d, heldItem: '' })); }}
                            className="w-5 h-5 rounded-full bg-clay-oat hover:bg-red-100 text-clay-silver hover:text-red-500 text-xs flex items-center justify-center shrink-0 transition-colors"
                          >✕</button>
                        </>
                      ) : (
                        <span className="text-sm text-clay-silver">
                          {lang === 'zh' ? '選擇持有物...' : 'Select held item...'}
                        </span>
                      )}
                    </button>
                  </div>

                </div>

                {/* Space below content */}
                <div className="flex-1" />

              </div>

            </div>

            {/* ── Screen C: Saved Builds ── */}
            <div className={`absolute inset-0 flex flex-col bg-white transition-transform duration-200 ${
              showBuilds ? 'translate-x-0' : 'translate-x-full'
            }`}>

              {/* Back header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-clay-border shrink-0">
                <button
                  onClick={() => setShowBuilds(false)}
                  className="text-clay-silver hover:text-clay-charcoal font-semibold shrink-0 transition-colors text-sm"
                >←</button>
                <span className="font-semibold text-clay-charcoal text-sm">
                  {lang === 'zh' ? '已存配置' : 'Saved Builds'}
                </span>
                <span className="text-xs text-clay-silver ml-auto">{builds.length}</span>
              </div>

              {/* Builds list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {builds.length === 0 ? (
                  <div className="text-center py-12 text-clay-silver text-sm">
                    {lang === 'zh' ? '尚無已存配置' : 'No saved builds'}
                  </div>
                ) : (
                  builds.map(build => {
                    const bAbilityEntry = abilityData[build.selectedAbility];
                    const bAbilityName = bAbilityEntry
                      ? (lang === 'zh' ? (bAbilityEntry.zh || bAbilityEntry.en) : (bAbilityEntry.en || bAbilityEntry.zh))
                      : (build.selectedAbility || '—');
                    const bNature = NATURES.find(n => n.en === build.nature);
                    const bNatureName = bNature ? (lang === 'zh' ? bNature.zh : bNature.en) : (build.nature || '—');

                    return (
                      <div
                        key={build.id}
                        onClick={() => {
                          setDraft({
                            selectedAbility: build.selectedAbility,
                            nature: build.nature,
                            bp: { ...build.bp },
                            selectedMoves: [...build.selectedMoves],
                            heldItem: build.heldItem,
                          });
                          setActiveBuildId(build.id);
                          setShowBuilds(false);
                        }}
                        className={`bg-white rounded-[16px] border shadow-clay overflow-hidden transition-all cursor-pointer ${
                          activeBuildId === build.id
                            ? 'border-clay-blue shadow-clay-md'
                            : 'border-clay-border hover:shadow-clay-md hover:border-clay-blue/40'
                        }`}
                      >

                        {/* Card header */}
                        <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-clay-border/50">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                            {activeBuildId === build.id && (
                              <span className="text-clay-blue text-xs font-bold shrink-0">✓</span>
                            )}
                            {editingBuildId === build.id ? (
                              <input
                                autoFocus
                                value={editingBuildName}
                                onChange={e => setEditingBuildName(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') commitRename();
                                  if (e.key === 'Escape') { setEditingBuildId(null); setEditingBuildName(''); }
                                }}
                                className="text-sm font-bold text-clay-charcoal bg-transparent border-b border-clay-blue focus:outline-none min-w-0 flex-1"
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <span className="text-sm font-bold text-clay-charcoal truncate">{build.name}</span>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingBuildId(build.id);
                                    setEditingBuildName(build.name);
                                  }}
                                  className="w-5 h-5 rounded flex items-center justify-center text-clay-silver hover:text-clay-blue hover:bg-clay-blue-light text-xs leading-none transition-colors shrink-0"
                                >✎</button>
                              </>
                            )}
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteBuild(build.id);
                              if (build.id === activeBuildId) setActiveBuildId(null);
                            }}
                            className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors shrink-0 ml-2"
                          >
                            {lang === 'zh' ? '移除' : 'Remove'}
                          </button>
                        </div>

                        {/* Metadata row */}
                        <div className="px-3 py-1.5 flex flex-wrap gap-x-2 gap-y-0.5 border-b border-clay-border/50">
                          <span className="text-xs text-clay-silver">{bNatureName}</span>
                          <span className="text-xs text-clay-silver">·</span>
                          <span className="text-xs text-clay-silver">{bAbilityName}</span>
                          {build.heldItem && <>
                            <span className="text-xs text-clay-silver">·</span>
                            {itemData[build.heldItem] ? (
                              <span className="flex items-center gap-1">
                                <ItemSprite slug={build.heldItem} category={itemData[build.heldItem].category} className="w-3.5 h-3.5" />
                                <span className="text-xs text-clay-silver">
                                  {lang === 'zh' ? (itemData[build.heldItem].zh || itemData[build.heldItem].en) : (itemData[build.heldItem].en || itemData[build.heldItem].zh)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs text-clay-silver">{build.heldItem}</span>
                            )}
                          </>}
                        </div>

                        {/* Stats + moves body */}
                        <div className="w-full p-3">
                          <div className="flex gap-3 items-center">

                            {/* Left: stat bars */}
                            <div className="flex-1 space-y-1.5 min-w-0">
                              {STAT_ORDER.map(stat => {
                                const entry = pokemon.stats?.find(s => s.stat.name === stat);
                                const base = entry?.base_stat ?? 0;
                                const bp = build.bp?.[stat] ?? 0;
                                const mod = getNatureMod(stat, bNature);
                                const isHP = stat === 'hp';
                                const calc = base > 0 ? calcStat(base, bp, mod, isHP) : 0;
                                const barPct = Math.min((calc / STAT_BAR_MAX) * 100, 100);
                                const color = STAT_COLORS[stat] || '#9CA3AF';
                                const natureUp = !isHP && mod > 1;
                                const natureDown = !isHP && mod < 1;
                                return (
                                  <div key={stat} className="flex items-center gap-1.5">
                                    <span className={`text-xs font-semibold w-10 shrink-0 whitespace-nowrap ${
                                      natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-clay-silver'
                                    }`}>
                                      {STAT_NAMES_ZH[stat]}{natureUp ? '↑' : natureDown ? '↓' : ''}
                                    </span>
                                    <div className="flex-1 bg-clay-border/30 rounded-full h-1.5 min-w-0">
                                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: color }} />
                                    </div>
                                    <span className={`text-xs font-mono w-7 text-right shrink-0 ${
                                      natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-clay-charcoal'
                                    }`}>{calc || '—'}</span>
                                    <span className="text-[10px] font-mono text-clay-silver shrink-0 w-6 text-right">
                                      {bp > 0 ? `+${bp}` : ''}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Right: move slots */}
                            <div className="w-[45%] space-y-1.5 shrink-0">
                              {[0, 1, 2, 3].map(i => {
                                const slug = build.selectedMoves?.[i];
                                const m = slug ? moveData[slug] : null;
                                const moveName = m ? (lang === 'zh' ? (m.zh || m.en) : (m.en || m.zh)) : null;
                                const typeColor = m ? (TYPE_COLORS[m.type] || '#888') : null;
                                return (
                                  <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-[12px] border ${
                                    m ? 'bg-white border-clay-border' : 'bg-clay-oat border-dashed border-clay-border/60'
                                  }`}>
                                    {m ? (
                                      <>
                                        <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: typeColor }}>
                                          <img src={`${TYPE_ICON_BASE}${m.type}.png`} alt="" className="h-2.5 w-2.5" />
                                        </span>
                                        <span className="text-xs font-semibold text-clay-charcoal truncate">{moveName}</span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-clay-border">
                                        {lang === 'zh' ? `招式 ${i + 1}` : `Move ${i + 1}`}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
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
                  className="text-clay-silver hover:text-clay-charcoal font-semibold shrink-0 transition-colors text-sm"
                >←</button>
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

                {/* Category filter — only available cats, disabled logic */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-clay-silver w-8 shrink-0">
                    {lang === 'zh' ? '類別' : 'Cat.'}
                  </span>
                  {availableMoveCats.map(cat => {
                    const disabled = isMoveCatDisabled(cat);
                    const active = moveCatFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={disabled ? undefined : () => setMoveCatFilter(active ? null : cat)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          disabled
                            ? 'opacity-25 cursor-not-allowed bg-white border-clay-border text-clay-silver'
                            : active
                              ? 'bg-clay-border text-clay-charcoal border-clay-border shadow-clay'
                              : 'bg-white border-clay-border text-clay-silver hover:text-clay-charcoal cursor-pointer'
                        }`}
                      >
                        <img src={`${CATEGORY_ICON_BASE}${cat}.png`} alt={cat} className="h-4 w-auto" draggable={false} />
                        {CATEGORY_LABEL[cat][lang === 'zh' ? 'zh' : 'en']}
                      </button>
                    );
                  })}
                </div>

                {/* Type filter — only available types, disabled logic, multi-select */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-clay-silver w-8 shrink-0">
                    {lang === 'zh' ? '屬性' : 'Type'}
                  </span>
                  {availableMoveTypes.map(t => {
                    const disabled = isMoveTypeDisabled(t);
                    const active = moveTypeFilter.has(t);
                    return (
                      <button
                        key={t}
                        onClick={disabled ? undefined : () => setMoveTypeFilter(prev => {
                          const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n;
                        })}
                        title={lang === 'zh' ? TYPE_NAMES_ZH[t] : t}
                        className={`flex items-center justify-center rounded-full transition-all overflow-hidden ${
                          disabled
                            ? 'opacity-20 cursor-not-allowed'
                            : active
                              ? 'ring-2 ring-offset-1 ring-clay-charcoal scale-110 cursor-pointer'
                              : 'opacity-90 hover:opacity-100 hover:scale-105 cursor-pointer'
                        }`}
                        style={{ width: 28, height: 28, backgroundColor: TYPE_COLORS[t] }}
                      >
                        <img src={`${TYPE_ICON_BASE}${t}.png`} alt="" className="h-5 w-5 object-contain" draggable={false} />
                      </button>
                    );
                  })}
                  {(moveTypeFilter.size > 0 || moveCatFilter || moveSearch) && (
                    <button
                      onClick={() => { setMoveTypeFilter(new Set()); setMoveCatFilter(null); setMoveSearch(''); }}
                      className="ml-1 text-xs text-clay-silver hover:text-red-500 underline transition-colors"
                    >
                      {lang === 'zh' ? '清除' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Move list — table layout matching MoveList */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10 bg-clay-oat border-b border-clay-border">
                    <tr>
                      <th className="pl-4 pr-2 py-2 text-left text-xs font-semibold text-clay-silver w-[30%]">
                        {lang === 'zh' ? '招式名稱' : 'Move'}
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-clay-silver w-[18%]">
                        {lang === 'zh' ? '屬性' : 'Type'}
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-clay-silver w-[22%]">
                        {lang === 'zh' ? '類別' : 'Cat.'}
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-clay-silver w-[12%]">
                        {lang === 'zh' ? '威力' : 'Pwr'}
                      </th>
                      <th className="pl-2 pr-4 py-2 text-center text-xs font-semibold text-clay-silver w-[18%]">
                        {lang === 'zh' ? '命中' : 'Acc'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-clay-border/40">
                      <td colSpan={5} className="pl-4 py-2">
                        <button
                          onClick={() => selectMove(null)}
                          className="text-sm text-clay-silver hover:text-clay-charcoal transition-colors"
                        >
                          {lang === 'zh' ? '— 移除招式 —' : '— Remove move —'}
                        </button>
                      </td>
                    </tr>
                    {filteredMoves.map((slug, idx) => {
                      const d = moveData[slug];
                      const name = lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh);
                      const hasEffect = !!getMoveEffectText(slug);
                      const catKey = d?.category;
                      return (
                        <tr
                          key={slug}
                          onClick={() => selectMove(slug)}
                          className={`border-b border-clay-border/20 last:border-0 cursor-pointer transition-colors ${
                            idx % 2 === 0 ? 'bg-white hover:bg-clay-blue-light' : 'bg-clay-cream hover:bg-clay-blue-light'
                          }`}
                        >
                          <td
                            className="pl-4 pr-2 py-2.5"
                            onMouseEnter={e => {
                              const text = getMoveEffectText(slug);
                              if (!text) { setMoveTooltip(null); return; }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMoveTooltip({ text, top: rect.top, left: rect.left + 80 });
                            }}
                            onMouseLeave={() => setMoveTooltip(null)}
                          >
                            <span className={`font-semibold leading-tight ${
                              hasEffect
                                ? 'text-clay-charcoal underline decoration-dotted decoration-clay-silver underline-offset-2'
                                : 'text-clay-silver'
                            }`}>{name}</span>
                          </td>
                          <td className="px-2 py-2.5">
                            {d?.type ? <TypeBadge type={d.type} size="xs" /> : <span className="text-clay-border">—</span>}
                          </td>
                          <td className="px-2 py-2.5">
                            {catKey ? (
                              <span className="inline-flex items-center gap-1.5">
                                <img src={`${CATEGORY_ICON_BASE}${catKey}.png`} alt={catKey} className="h-4 w-auto shrink-0" draggable={false} />
                                <span className={`text-xs font-semibold ${
                                  catKey === 'physical' ? 'text-orange-700'
                                  : catKey === 'special' ? 'text-blue-700'
                                  : 'text-clay-silver'
                                }`}>{CATEGORY_LABEL[catKey][lang === 'zh' ? 'zh' : 'en']}</span>
                              </span>
                            ) : <span className="text-clay-border">—</span>}
                          </td>
                          <td className="px-2 py-2.5 text-center tabular-nums">
                            {d?.power != null
                              ? <span className="font-bold text-clay-charcoal text-xs">{d.power}</span>
                              : <span className="text-clay-border text-xs">—</span>}
                          </td>
                          <td className="pl-2 pr-4 py-2.5 text-center tabular-nums">
                            {d?.accuracy != null
                              ? <span className="text-clay-charcoal text-xs">{d.accuracy}%</span>
                              : <span className="text-clay-border text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMoves.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-clay-silver text-sm">
                          {lang === 'zh' ? '沒有符合條件的招式' : 'No moves found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Screen D: Item Picker ── */}
            <div className={`absolute inset-0 flex flex-col bg-white transition-transform duration-200 ${
              showItemPicker ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {/* Back header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-clay-border shrink-0">
                <button
                  onClick={() => setShowItemPicker(false)}
                  className="text-clay-silver hover:text-clay-charcoal font-semibold shrink-0 transition-colors text-sm"
                >←</button>
                <span className="font-semibold text-clay-charcoal text-sm">
                  {lang === 'zh' ? '選擇持有物' : 'Select Held Item'}
                </span>
                <span className="text-xs text-clay-silver ml-auto">
                  {Object.entries(itemData).filter(([slug, d]) => {
                    if (itemCatFilter && d.category !== itemCatFilter) return false;
                    if (itemSearch) {
                      const q = itemSearch.toLowerCase();
                      return (d.zh || '').includes(q) || (d.en || '').toLowerCase().includes(q);
                    }
                    return true;
                  }).length}
                </span>
              </div>

              {/* Filters */}
              <div className="px-4 py-2.5 space-y-2 border-b border-clay-border shrink-0">
                <input
                  type="text"
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                  placeholder={lang === 'zh' ? '搜尋道具...' : 'Search item...'}
                  className="w-full border border-clay-border rounded-[12px] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ITEM_CATEGORIES.map(cat => {
                    const active = itemCatFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setItemCatFilter(active ? null : cat)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          active
                            ? 'bg-clay-border text-clay-charcoal border-clay-border shadow-clay'
                            : 'bg-white border-clay-border text-clay-silver hover:text-clay-charcoal'
                        }`}
                      >
                        {ITEM_CATEGORY_LABEL[cat][lang === 'zh' ? 'zh' : 'en']}
                      </button>
                    );
                  })}
                  {(itemCatFilter || itemSearch) && (
                    <button
                      onClick={() => { setItemCatFilter(null); setItemSearch(''); }}
                      className="ml-1 text-xs text-clay-silver hover:text-red-500 underline transition-colors"
                    >
                      {lang === 'zh' ? '清除' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Item list */}
              <div className="flex-1 overflow-y-auto">
                {/* Remove item row */}
                <button
                  onClick={() => { setDraft(d => ({ ...d, heldItem: '' })); setShowItemPicker(false); }}
                  className="w-full px-4 py-2.5 text-sm text-clay-silver hover:text-clay-charcoal border-b border-clay-border/40 text-left transition-colors"
                >
                  {lang === 'zh' ? '— 移除持有物 —' : '— Remove held item —'}
                </button>
                {Object.entries(itemData)
                  .filter(([slug, d]) => {
                    if (itemCatFilter && d.category !== itemCatFilter) return false;
                    if (itemSearch) {
                      const q = itemSearch.toLowerCase();
                      return (d.zh || '').includes(q) || (d.en || '').toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map(([slug, d], idx) => {
                    const name = lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh);
                    const isActive = draft.heldItem === slug;
                    const effectText = d.category !== 'MEGA_STONE'
                      ? (lang === 'zh' ? (d.zhEffect || d.enEffect) : (d.enEffect || d.zhEffect))
                      : null;
                    return (
                      <button
                        key={slug}
                        onClick={() => { setDraft(dr => ({ ...dr, heldItem: slug })); setShowItemPicker(false); }}
                        onMouseEnter={effectText ? e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setItemTooltip({ text: effectText, top: rect.top, left: rect.left + 80 });
                        } : undefined}
                        onMouseLeave={effectText ? () => setItemTooltip(null) : undefined}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-clay-border/20 text-left transition-colors ${
                          isActive
                            ? 'bg-clay-blue-light text-clay-blue'
                            : idx % 2 === 0 ? 'bg-white hover:bg-clay-blue-light' : 'bg-clay-cream hover:bg-clay-blue-light'
                        }`}
                      >
                        <ItemSprite slug={slug} category={d.category} />
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-clay-blue' : 'text-clay-charcoal'}`}>{name}</span>
                        <span className="ml-auto text-xs text-clay-silver shrink-0">
                          {ITEM_CATEGORY_LABEL[d.category]?.[lang === 'zh' ? 'zh' : 'en'] || d.category}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

          </div>

          {/* Tooltips — outside transform containers so fixed positioning uses viewport */}
          {moveTooltip && (
            <div
              className="fixed z-[80] max-w-xs bg-clay-charcoal/95 text-white text-xs rounded-[12px] px-3 py-2 leading-relaxed shadow-clay-md pointer-events-none"
              style={{ top: moveTooltip.top, left: moveTooltip.left }}
            >
              {moveTooltip.text}
            </div>
          )}
          {itemTooltip && (
            <div
              className="fixed z-[80] max-w-xs bg-clay-charcoal/95 text-white text-xs rounded-[12px] px-3 py-2 leading-relaxed shadow-clay-md pointer-events-none"
              style={{ top: itemTooltip.top, left: itemTooltip.left }}
            >
              {itemTooltip.text}
            </div>
          )}

          {/* Footer — always rendered to maintain consistent modal height */}
          <div className="px-5 py-3 border-t border-clay-border shrink-0">
            {movePickerSlot !== null || showBuilds || showItemPicker ? (
              <div className="h-9" />
            ) : showSaveInput ? (
              /* Inline save input */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder={lang === 'zh' ? '配置名稱...' : 'Build name...'}
                  autoFocus
                  onCompositionStart={() => { isComposing.current = true; }}
                  onCompositionEnd={() => { isComposing.current = false; }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isComposing.current) doSaveBuild();
                    if (e.key === 'Escape') { setShowSaveInput(false); setSaveName(''); }
                  }}
                  className="flex-1 border border-clay-border rounded-[12px] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
                />
                <button
                  onClick={() => { setShowSaveInput(false); setSaveName(''); }}
                  className="px-3 py-1.5 text-sm text-clay-silver hover:text-clay-charcoal border border-clay-border rounded-[12px] transition-colors"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  disabled={!saveName.trim()}
                  onClick={doSaveBuild}
                  className="px-3 py-1.5 text-sm bg-clay-blue text-white font-semibold rounded-[12px] disabled:opacity-40 transition-opacity"
                >
                  {lang === 'zh' ? '儲存' : 'Save'}
                </button>
              </div>
            ) : activeBuildId ? (
              /* Active build footer: update or save-as-new */
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={doUpdateBuild}
                  className="px-4 py-2 border border-clay-blue text-clay-blue hover:bg-clay-blue-light rounded-full text-sm font-semibold transition-colors"
                >
                  {lang === 'zh' ? '更新配置' : 'Update Build'}
                </button>
                <button
                  onClick={() => {
                    setSaveName(`配置 ${builds.length + 1}`);
                    setShowSaveInput(true);
                  }}
                  className="px-4 py-2 border border-clay-border text-clay-silver hover:text-clay-charcoal hover:bg-clay-oat rounded-full text-sm font-semibold transition-colors"
                >
                  {lang === 'zh' ? '另存新配置' : 'Save As New'}
                </button>
                <button
                  onClick={() => onConfirm(draft)}
                  className="px-8 py-2 bg-clay-blue hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity shadow-clay"
                >
                  {lang === 'zh' ? '確認' : 'Confirm'}
                </button>
              </div>
            ) : (
              /* Normal footer */
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => {
                    setSaveName(`配置 ${builds.length + 1}`);
                    setShowSaveInput(true);
                  }}
                  className="px-5 py-2 border border-clay-border text-clay-silver hover:text-clay-charcoal hover:bg-clay-oat rounded-full text-sm font-semibold transition-colors"
                >
                  {lang === 'zh' ? '儲存配置' : 'Save Build'}
                </button>
                <button
                  onClick={() => onConfirm(draft)}
                  className="px-12 py-2 bg-clay-blue hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity shadow-clay"
                >
                  {lang === 'zh' ? '確認' : 'Confirm'}
                </button>
              </div>
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
