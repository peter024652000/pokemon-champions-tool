import { useState, useMemo } from 'react';
import { useLang } from '../../context/LangContext';
import { TYPE_COLORS, TYPE_NAMES_ZH, TYPE_ICON_BASE, ALL_TYPES } from '../../utils/constants';
import moveData from '../../data/move-data.json';

const CATEGORY_ICON_BASE = 'https://img.pokemondb.net/images/icons/move-';
const CATEGORIES = ['physical', 'special', 'status'];
const CATEGORY_LABEL = {
  physical: { zh: '物理', en: 'Physical' },
  special:  { zh: '特殊', en: 'Special'  },
  status:   { zh: '變化', en: 'Status'   },
};

export default function MovePicker({ moveSlugs, slotIndex, onSelect, onClose }) {
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [catFilter, setCatFilter] = useState(null);

  const sortedMoves = useMemo(() => {
    return moveSlugs
      .filter(slug => moveData[slug])
      .sort((a, b) => {
        const ta = ALL_TYPES.indexOf(moveData[a]?.type);
        const tb = ALL_TYPES.indexOf(moveData[b]?.type);
        return ta - tb;
      });
  }, [moveSlugs]);

  const filtered = useMemo(() => {
    return sortedMoves.filter(slug => {
      const d = moveData[slug];
      if (typeFilter && d.type !== typeFilter) return false;
      if (catFilter && d.category !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(d.zh || '').includes(q) && !(d.en || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sortedMoves, typeFilter, catFilter, search]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-clay-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="text-clay-silver hover:text-clay-charcoal text-lg leading-none">✕</button>
        <span className="font-bold text-clay-charcoal">
          {lang === 'zh' ? `招式 ${slotIndex + 1}` : `Move ${slotIndex + 1}`}
        </span>
        <span className="text-xs text-clay-silver ml-auto">{filtered.length}</span>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-clay-border px-4 py-3 space-y-2.5 shrink-0">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'zh' ? '搜尋招式...' : 'Search move...'}
          autoFocus
          className="w-full border border-clay-border rounded-[16px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
        />

        {/* Type filter */}
        <div className="flex gap-1 flex-wrap items-center">
          {typeFilter && (
            <button
              onClick={() => setTypeFilter(null)}
              className="text-xs text-clay-silver hover:text-clay-charcoal px-2 py-1 rounded-lg border border-clay-border hover:border-clay-border shrink-0"
            >
              {lang === 'zh' ? '清除' : 'Clear'}
            </button>
          )}
          {ALL_TYPES.map(t => {
            const active = typeFilter === t;
            const color = TYPE_COLORS[t];
            const label = lang === 'zh' ? TYPE_NAMES_ZH[t] : t.charAt(0).toUpperCase() + t.slice(1);
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(active ? null : t)}
                title={label}
                className={`flex items-center justify-center rounded-full transition-all overflow-hidden ${
                  active
                    ? 'ring-2 ring-offset-1 ring-clay-charcoal scale-110'
                    : 'opacity-90 hover:opacity-100 hover:scale-105'
                }`}
                style={{ width: 28, height: 28, backgroundColor: color }}
              >
                <img src={`${TYPE_ICON_BASE}${t}.png`} alt={label} className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(catFilter === cat ? null : cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                catFilter === cat
                  ? 'bg-clay-charcoal border-clay-charcoal text-white shadow-clay'
                  : 'bg-white border-clay-border text-clay-silver hover:border-clay-border hover:text-clay-charcoal'
              }`}
            >
              <img src={`${CATEGORY_ICON_BASE}${cat}.png`} alt={cat} className="h-4 w-auto" />
              {CATEGORY_LABEL[cat][lang === 'zh' ? 'zh' : 'en']}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="bg-clay-oat border-b border-clay-border px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-clay-silver">
          <span className="w-24 shrink-0">{lang === 'zh' ? '屬性' : 'Type'}</span>
          <span className="w-10 shrink-0">{lang === 'zh' ? '類別' : 'Cat.'}</span>
          <span className="flex-1">{lang === 'zh' ? '招式名稱' : 'Move Name'}</span>
          <span className="w-10 text-right shrink-0">{lang === 'zh' ? '威力' : 'Power'}</span>
          <span className="w-10 text-right shrink-0">{lang === 'zh' ? '命中' : 'Acc.'}</span>
        </div>
      </div>

      {/* Move list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Remove option */}
        <button
          onClick={() => onSelect(null)}
          className="w-full px-4 py-2.5 text-sm text-clay-silver hover:bg-clay-oat text-left border-b border-clay-border/40"
        >
          {lang === 'zh' ? '— 移除招式 —' : '— Remove move —'}
        </button>

        {filtered.map(slug => {
          const d = moveData[slug];
          const name = lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh);
          const color = TYPE_COLORS[d.type] || '#888';
          const typeName = lang === 'zh'
            ? (TYPE_NAMES_ZH[d.type] || d.type)
            : (d.type.charAt(0).toUpperCase() + d.type.slice(1));

          return (
            <button
              key={slug}
              onClick={() => onSelect(slug)}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-clay-blue-light text-left transition-colors border-b border-clay-border/30"
            >
              {/* Type badge */}
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shrink-0 w-24"
                style={{ backgroundColor: color }}
              >
                <img src={`${TYPE_ICON_BASE}${d.type}.png`} alt="" className="h-3 w-3 shrink-0" />
                {typeName}
              </span>

              {/* Category icon */}
              <span className="w-10 shrink-0 flex items-center">
                <img src={`${CATEGORY_ICON_BASE}${d.category}.png`} alt={d.category} className="h-4 w-auto" />
              </span>

              {/* Move name */}
              <span className="text-sm text-clay-charcoal font-medium flex-1 truncate">{name}</span>

              {/* Power */}
              <span className="w-10 text-right text-xs font-mono text-clay-charcoal shrink-0">
                {d.power ?? '—'}
              </span>

              {/* Accuracy */}
              <span className="w-10 text-right text-xs font-mono text-clay-silver shrink-0">
                {d.accuracy != null ? `${d.accuracy}%` : '—'}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-clay-silver text-sm">
            {lang === 'zh' ? '沒有符合條件的招式' : 'No moves found'}
          </div>
        )}
      </div>
    </div>
  );
}
