import { useState } from 'react';
import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';
import { TYPE_COLORS, TYPE_NAMES_ZH, TYPE_ICON_BASE, ALL_TYPES } from '../utils/constants';
import moveData from '../data/move-data.json';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_ICON_BASE = 'https://img.pokemondb.net/images/icons/move-';
const CATEGORIES = ['physical', 'special', 'status'];
const CATEGORY_LABEL = {
  physical: { zh: '物理', en: 'Physical' },
  special:  { zh: '特殊', en: 'Special'  },
  status:   { zh: '變化', en: 'Status'   },
};

// ── Sort ──────────────────────────────────────────────────────────────────────
function sortValue(slug, col, lang) {
  const d = moveData[slug];
  if (col === 'name')     return lang === 'zh' ? (d?.zh || d?.en || slug) : (d?.en || slug);
  if (col === 'priority') return d?.priority ?? 0;
  if (col === 'type')     return ALL_TYPES.indexOf(d?.type ?? '');   // 按 ALL_TYPES 順序
  if (col === 'category') return ({ physical: 0, special: 1, status: 2 })[d?.category] ?? 3;
  if (col === 'power')    return d?.power ?? -1;
  if (col === 'accuracy') return d?.accuracy ?? -1;
  if (col === 'pp')       return d?.pp ?? -1;
  return 0;
}

// ── Effect text ───────────────────────────────────────────────────────────────
function getEffectText(slug, lang) {
  const d = moveData[slug];
  if (!d) return null;
  const raw = lang === 'zh' ? (d.zhEffect || d.enEffect) : (d.enEffect || d.zhEffect);
  if (!raw) return null;
  return raw.replace(/\$effect_chance%/g, (d.effectChance || '?') + '%');
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <span className="ml-0.5 text-gray-300 text-xs">↕</span>;
  return <span className="ml-0.5 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function CategoryFilterBtn({ cat, active, disabled, onClick, lang }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all
        ${disabled
          ? 'opacity-25 cursor-not-allowed bg-white border-gray-200 text-gray-400'
          : active
            ? 'bg-gray-800 border-gray-700 text-white shadow-sm'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer'}`}
    >
      <img
        src={`${CATEGORY_ICON_BASE}${cat}.png`}
        alt={cat}
        className="h-4 w-auto"
        draggable={false}
      />
      {CATEGORY_LABEL[cat][lang === 'zh' ? 'zh' : 'en']}
    </button>
  );
}

function TypeFilterBtn({ type, active, disabled, onClick, lang }) {
  const color = TYPE_COLORS[type] || '#888';
  const label = lang === 'zh' ? (TYPE_NAMES_ZH[type] || type) : type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={label}
      className={`flex items-center justify-center rounded-full transition-all overflow-hidden
        ${disabled
          ? 'opacity-20 cursor-not-allowed'
          : active
            ? 'ring-2 ring-offset-1 ring-gray-700 scale-110 cursor-pointer'
            : 'opacity-90 hover:opacity-100 hover:scale-105 cursor-pointer'}`}
      style={{ width: 28, height: 28, backgroundColor: color }}
    >
      <img
        src={`${TYPE_ICON_BASE}${type}.png`}
        alt={label}
        className="h-5 w-5 object-contain"
        draggable={false}
      />
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MoveList({ moves }) {
  const { lang } = useLang();
  const zh = lang === 'zh';

  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState(new Set());  // multi-select
  const [catFilter, setCatFilter]   = useState(null);       // single-select: null | string
  const [sortCol, setSortCol]       = useState('type');
  const [sortDir, setSortDir]       = useState('asc');
  const [tooltip, setTooltip]       = useState(null);       // { text, top, left }

  // ── All slugs, types, categories for this pokemon ──
  const allSlugs = [...new Set(moves.map(m => m.move.name))];

  // Types present in this pokemon's moves, ordered by ALL_TYPES
  const availableTypes = ALL_TYPES.filter(t =>
    allSlugs.some(s => moveData[s]?.type === t)
  );
  // Categories present, ordered by CATEGORIES
  const availableCategories = CATEGORIES.filter(c =>
    allSlugs.some(s => moveData[s]?.category === c)
  );

  // ── Disabled state (mutual exclusion) ──
  // A type T is disabled if catFilter is set and no move has both type=T AND category=catFilter
  function isTypeDisabled(type) {
    if (!catFilter) return false;
    return !allSlugs.some(s => moveData[s]?.type === type && moveData[s]?.category === catFilter);
  }
  // A category C is disabled if any types are selected and no move has category=C AND type∈typeFilter
  function isCatDisabled(cat) {
    if (typeFilter.size === 0) return false;
    return !allSlugs.some(s => typeFilter.has(moveData[s]?.type) && moveData[s]?.category === cat);
  }

  // ── Filter ──
  const term = search.trim().toLowerCase();
  const filtered = allSlugs.filter(slug => {
    const d = moveData[slug];
    if (typeFilter.size > 0 && !typeFilter.has(d?.type)) return false;
    if (catFilter && d?.category !== catFilter) return false;
    if (term) {
      return slug.includes(term)
        || (d?.zh && d.zh.includes(term))
        || (d?.en && d.en.toLowerCase().includes(term));
    }
    return true;
  });

  // ── Sort ──
  const sorted = [...filtered].sort((a, b) => {
    const va = sortValue(a, sortCol, lang);
    const vb = sortValue(b, sortCol, lang);
    let cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    // secondary: when type is primary sort, sub-sort by category then power desc
    if (cmp === 0 && sortCol === 'type') {
      const ca = ({ physical: 0, special: 1, status: 2 })[moveData[a]?.category] ?? 3;
      const cb = ({ physical: 0, special: 1, status: 2 })[moveData[b]?.category] ?? 3;
      cmp = ca - cb;
    }
    // tertiary: power desc for ties
    if (cmp === 0 && sortCol !== 'power') {
      cmp = (moveData[b]?.power ?? -1) - (moveData[a]?.power ?? -1);
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // ── Handlers ──
  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(['power', 'accuracy', 'pp'].includes(col) ? 'desc' : 'asc');
    }
  }

  function toggleType(t) {
    setTypeFilter(prev => {
      const n = new Set(prev);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  }

  function toggleCat(c) {
    setCatFilter(prev => prev === c ? null : c);
  }

  function handleNameEnter(e, slug) {
    const text = getEffectText(slug, lang);
    if (!text) { setTooltip(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const TOOLTIP_EST_HEIGHT = 72;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < TOOLTIP_EST_HEIGHT + 12
      ? rect.top - TOOLTIP_EST_HEIGHT - 4   // 上方顯示（靠近底部時）
      : rect.bottom + 4;                     // 下方顯示
    setTooltip({ text, top, left: rect.left });
  }

  const hasFilter = typeFilter.size > 0 || catFilter !== null || term;

  // ── Th helper ──
  const Th = ({ col, className = '', children }) => (
    <th
      className={`px-2 py-2.5 font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center">
        {children}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </span>
    </th>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-700">
            {zh ? '可學招式' : 'Learnable Moves'}
          </h3>
          <p className="text-sm text-gray-400">
            {filtered.length === allSlugs.length
              ? (zh ? `共 ${allSlugs.length} 招` : `${allSlugs.length} moves`)
              : (zh ? `${filtered.length} / ${allSlugs.length} 招` : `${filtered.length} of ${allSlugs.length} moves`)}
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={zh ? '搜尋招式...' : 'Search moves...'}
          className="w-40 shrink-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* ── Filters ── */}
      <div className="mb-3 space-y-2">
        {/* Category — single select */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 w-8 shrink-0">
            {zh ? '類別' : 'Cat.'}
          </span>
          {availableCategories.map(cat => (
            <CategoryFilterBtn
              key={cat}
              cat={cat}
              active={catFilter === cat}
              disabled={isCatDisabled(cat)}
              onClick={() => toggleCat(cat)}
              lang={lang}
            />
          ))}
        </div>

        {/* Type — multi select, ordered by ALL_TYPES */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 w-8 shrink-0">
            {zh ? '屬性' : 'Type'}
          </span>
          {availableTypes.map(type => (
            <TypeFilterBtn
              key={type}
              type={type}
              active={typeFilter.has(type)}
              disabled={isTypeDisabled(type)}
              onClick={() => toggleType(type)}
              lang={lang}
            />
          ))}
          {hasFilter && (
            <button
              onClick={() => { setTypeFilter(new Set()); setCatFilter(null); setSearch(''); }}
              className="ml-1 text-xs text-gray-400 hover:text-red-500 underline transition-colors"
            >
              {zh ? '清除' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tooltip (fixed, outside table flow) ── */}
      {tooltip && (
        <div
          className="fixed z-50 max-w-sm bg-gray-900/95 text-white text-xs rounded-xl px-3 py-2 leading-relaxed shadow-xl pointer-events-none"
          style={{ top: tooltip.top, left: tooltip.left }}
        >
          {tooltip.text}
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <Th col="name"     className="text-left w-[30%] pl-3">{zh ? '招式名稱' : 'Move'}</Th>
              <Th col="priority" className="text-center w-[8%]">{zh ? '先制' : 'Pri'}</Th>
              <Th col="type"     className="text-left w-[13%]">{zh ? '屬性' : 'Type'}</Th>
              <Th col="category" className="text-left w-[16%]">{zh ? '類別' : 'Category'}</Th>
              <Th col="power"    className="text-center w-[10%]">{zh ? '威力' : 'Pwr'}</Th>
              <Th col="accuracy" className="text-center w-[10%]">{zh ? '命中' : 'Acc'}</Th>
              <Th col="pp"       className="text-center w-[9%] pr-3">PP</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((slug, idx) => {
              const d = moveData[slug];
              const name = zh ? (d?.zh || d?.en || slug) : (d?.en || slug);
              const hasEffect = !!getEffectText(slug, lang);
              const catKey = d?.category;

              return (
                <tr
                  key={slug}
                  className={`border-b border-gray-100 last:border-0 cursor-default transition-colors
                    ${idx % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50/40 hover:bg-blue-50'}`}
                >
                  {/* Name — tooltip 只在這格觸發 */}
                  <td
                    className="pl-3 pr-2 py-2.5"
                    onMouseEnter={e => handleNameEnter(e, slug)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className={`font-semibold leading-tight ${hasEffect ? 'text-gray-800 underline decoration-dotted decoration-gray-400 underline-offset-2' : 'text-gray-600'}`}>
                      {name}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-2 py-2.5 text-center tabular-nums align-top">
                    {d?.priority > 0
                      ? <span className="font-bold text-green-600">+{d.priority}</span>
                      : d?.priority < 0
                        ? <span className="font-bold text-red-500">{d.priority}</span>
                        : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Type */}
                  <td className="px-2 py-2.5 align-top">
                    {d?.type
                      ? <TypeBadge type={d.type} size="xs" />
                      : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Category */}
                  <td className="px-2 py-2.5 align-top">
                    {catKey ? (
                      <span className="inline-flex items-center gap-1.5">
                        <img
                          src={`${CATEGORY_ICON_BASE}${catKey}.png`}
                          alt={catKey}
                          className="h-4 w-auto shrink-0"
                          draggable={false}
                        />
                        <span className={`text-xs font-semibold ${
                          catKey === 'physical' ? 'text-orange-700'
                          : catKey === 'special' ? 'text-blue-700'
                          : 'text-gray-500'
                        }`}>
                          {CATEGORY_LABEL[catKey][zh ? 'zh' : 'en']}
                        </span>
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Power */}
                  <td className="px-2 py-2.5 text-center tabular-nums align-top">
                    {d?.power != null
                      ? <span className="font-bold text-gray-700">{d.power}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Accuracy */}
                  <td className="px-2 py-2.5 text-center tabular-nums align-top">
                    {d?.accuracy != null
                      ? <span className="text-gray-600">{d.accuracy}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>

                  {/* PP */}
                  <td className="pr-3 pl-2 py-2.5 text-center tabular-nums align-top">
                    {d?.pp != null
                      ? <span className="text-gray-500">{d.pp}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  {zh ? '沒有符合的招式' : 'No moves found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
