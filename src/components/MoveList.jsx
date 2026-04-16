import { useState, useEffect, useRef } from 'react';
import { fetchMove } from '../utils/pokeapi';
import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';
import moveNamesData from '../data/move-names.json';

const CATEGORY_LABEL_ZH = { physical: '物理', special: '特殊', status: '變化' };
const CATEGORY_LABEL_EN = { physical: 'Physical', special: 'Special', status: 'Status' };
const CATEGORY_STYLE = {
  physical: 'bg-orange-100 text-orange-700',
  special:  'bg-blue-100 text-blue-700',
  status:   'bg-gray-100 text-gray-500',
};

export default function MoveList({ moves }) {
  const [search, setSearch] = useState('');
  const [details, setDetails] = useState({});
  const [hoveredMove, setHoveredMove] = useState(null);
  const { lang } = useLang();
  const loadedRef = useRef(new Set());
  const cancelledRef = useRef(false);

  // Pre-load all moves in batches when component mounts or Pokemon changes
  useEffect(() => {
    cancelledRef.current = false;
    loadedRef.current = new Set();
    setDetails({});
    setHoveredMove(null);

    const slice = moves.slice(0, 60);

    const loadDetail = async (moveName) => {
      if (loadedRef.current.has(moveName)) return;
      loadedRef.current.add(moveName);
      try {
        const data = await fetchMove(moveName);
        if (cancelledRef.current) return;

        // 名稱優先用本地 JSON（完整繁中）
        const local = moveNamesData[moveName];
        const zhName = local?.zh || null;
        const enName = local?.en || data.names?.find(n => n.language.name === 'en')?.name || null;

        // Description: prefer zh-Hant flavor text, fallback to English effect/flavor
        const zhDesc = data.flavor_text_entries
          ?.filter(e => e.language.name === 'zh-Hant')
          ?.pop()?.flavor_text?.replace(/[\n\f]/g, ' ') || null;
        const enDesc = data.effect_entries?.find(e => e.language.name === 'en')?.short_effect
          || data.flavor_text_entries?.filter(e => e.language.name === 'en')?.pop()?.flavor_text?.replace(/[\n\f]/g, ' ')
          || null;

        setDetails(prev => ({
          ...prev,
          [moveName]: {
            zhName, enName,
            type: data.type.name,
            category: data.damage_class.name,
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
            zhDesc,
            enDesc,
          },
        }));
      } catch {
        if (!cancelledRef.current) {
          setDetails(prev => ({ ...prev, [moveName]: { error: true } }));
        }
      }
    };

    const load = async () => {
      const BATCH = 8;
      for (let i = 0; i < slice.length; i += BATCH) {
        if (cancelledRef.current) break;
        await Promise.allSettled(slice.slice(i, i + BATCH).map(({ move }) => loadDetail(move.name)));
      }
    };

    load();
    return () => { cancelledRef.current = true; };
  }, [moves]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleMoves = moves.slice(0, 60);

  const filtered = visibleMoves.filter(({ move }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const d = details[move.name];
    return move.name.includes(q)
      || (d?.zhName && d.zhName.includes(q))
      || (d?.enName && d.enName.toLowerCase().includes(q));
  });

  return (
    <div>
      <h3 className="text-base font-bold mb-1 text-gray-700">
        {lang === 'zh' ? '可學招式' : 'Learnable Moves'}
      </h3>
      <p className="text-xs text-gray-400 mb-2">
        {lang === 'zh' ? `共 ${visibleMoves.length} 招（hover 查看說明）` : `${visibleMoves.length} moves — hover for description`}
      </p>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={lang === 'zh' ? '搜尋招式名稱...' : 'Search moves...'}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
        {filtered.map(({ move }) => {
          const d = details[move.name];
          const isHovered = hoveredMove === move.name;
          const name = d
            ? (lang === 'zh' ? (d.zhName || d.enName || move.name) : (d.enName || move.name))
            : move.name;
          const desc = d ? (lang === 'zh' ? (d.zhDesc || d.enDesc) : d.enDesc) : null;

          return (
            <div
              key={move.name}
              onMouseEnter={() => setHoveredMove(move.name)}
              onMouseLeave={() => setHoveredMove(null)}
              className={`px-3 py-2 rounded-xl border transition-colors cursor-default
                ${isHovered ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
            >
              {!d ? (
                <span className="text-xs text-gray-300 animate-pulse">{move.name}</span>
              ) : d.error ? (
                <span className="text-xs text-red-400">{move.name}</span>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{name}</span>
                    <TypeBadge type={d.type} size="sm" />
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_STYLE[d.category] || CATEGORY_STYLE.status}`}>
                      {(lang === 'zh' ? CATEGORY_LABEL_ZH : CATEGORY_LABEL_EN)[d.category] || d.category}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto flex gap-3 shrink-0">
                      <span>{lang === 'zh' ? '威力' : 'Pwr'} <b className="text-gray-600">{d.power ?? '—'}</b></span>
                      <span>{lang === 'zh' ? '命中' : 'Acc'} <b className="text-gray-600">{d.accuracy ?? '—'}</b></span>
                      <span>PP <b className="text-gray-600">{d.pp ?? '—'}</b></span>
                    </span>
                  </div>
                  {isHovered && desc && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed border-t border-blue-100 pt-1.5">
                      {desc}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">
            {lang === 'zh' ? '沒有符合的招式' : 'No moves found'}
          </p>
        )}
      </div>
    </div>
  );
}
