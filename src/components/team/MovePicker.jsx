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
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-start justify-center pt-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          <span className="font-bold text-gray-800">
            {lang === 'zh' ? `招式 ${slotIndex + 1}` : `Move ${slotIndex + 1}`}
          </span>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length}</span>
        </div>

        <div className="px-4 py-2.5 border-b border-gray-100 space-y-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'zh' ? '搜尋招式...' : 'Search move...'}
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex gap-1 flex-wrap">
            {ALL_TYPES.map(t => {
              const active = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(active ? null : t)}
                  title={lang === 'zh' ? TYPE_NAMES_ZH[t] : t}
                  className={`w-6 h-6 rounded-full transition-all ${
                    active ? 'ring-2 ring-offset-1 ring-gray-700 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: TYPE_COLORS[t] }}
                />
              );
            })}
          </div>
          <div className="flex gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(catFilter === cat ? null : cat)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                  catFilter === cat
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <img src={`${CATEGORY_ICON_BASE}${cat}.png`} alt={cat} className="h-4 w-auto" />
                {CATEGORY_LABEL[cat][lang === 'zh' ? 'zh' : 'en']}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => onSelect(null)}
            className="w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 text-left border-b border-gray-100"
          >
            {lang === 'zh' ? '— 移除招式 —' : '— Remove move —'}
          </button>

          {filtered.map(slug => {
            const d = moveData[slug];
            const name = lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh);
            const color = TYPE_COLORS[d.type] || '#888';
            const typeName = lang === 'zh' ? TYPE_NAMES_ZH[d.type] : (d.type.charAt(0).toUpperCase() + d.type.slice(1));
            return (
              <button
                key={slug}
                onClick={() => onSelect(slug)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-left transition-colors border-b border-gray-50"
              >
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <img src={`${TYPE_ICON_BASE}${d.type}.png`} alt="" className="h-3 w-3" />
                  {typeName}
                </span>
                <img src={`${CATEGORY_ICON_BASE}${d.category}.png`} alt={d.category} className="h-4 w-auto shrink-0" />
                <span className="text-sm text-gray-800 font-medium flex-1 truncate">{name}</span>
                <span className="text-xs text-gray-400 shrink-0 font-mono">{d.power ?? '—'}</span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              {lang === 'zh' ? '沒有符合條件的招式' : 'No moves found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
