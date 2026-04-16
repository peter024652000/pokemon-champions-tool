import { useState } from 'react';
import { fetchMove, getChineseName } from '../utils/pokeapi';
import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';

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
  const [loading, setLoading] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { lang } = useLang();

  const filtered = moves
    .filter(({ move }) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const d = details[move.name];
      return move.name.includes(q) || (d?.zhName && d.zhName.includes(q));
    })
    .slice(0, 60);

  const handleClick = async (moveName) => {
    if (expanded === moveName) { setExpanded(null); return; }
    setExpanded(moveName);
    if (details[moveName]) return;

    setLoading(moveName);
    try {
      const data = await fetchMove(moveName);
      const zhName = getChineseName(data.names);
      const enName = data.names?.find(n => n.language.name === 'en')?.name || null;
      setDetails(prev => ({
        ...prev,
        [moveName]: {
          zhName,
          enName,
          type:     data.type.name,
          category: data.damage_class.name,
          power:    data.power,
          accuracy: data.accuracy,
          pp:       data.pp,
        },
      }));
    } catch {
      setDetails(prev => ({ ...prev, [moveName]: { error: true } }));
    } finally {
      setLoading(null);
    }
  };

  const catLabel = lang === 'zh' ? CATEGORY_LABEL_ZH : CATEGORY_LABEL_EN;

  return (
    <div>
      <h3 className="text-base font-bold mb-1 text-gray-700">
        {lang === 'zh' ? '可學招式' : 'Learnable Moves'}
      </h3>
      <p className="text-xs text-gray-400 mb-2">
        {lang === 'zh' ? '點擊招式顯示詳細資料（最多顯示 60 筆）' : 'Click a move for details (max 60 shown)'}
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
          const isOpen = expanded === move.name;
          const isLoading = loading === move.name;

          // Display name based on language
          const moveName = d
            ? (lang === 'zh' ? (d.zhName || d.enName || move.name) : (d.enName || d.zhName || move.name))
            : move.name;

          return (
            <button
              key={move.name}
              onClick={() => handleClick(move.name)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors border
                ${isOpen ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
            >
              {isLoading ? (
                <span className="text-xs text-gray-400">{lang === 'zh' ? '載入中...' : 'Loading...'}</span>
              ) : d?.error ? (
                <span className="text-xs text-red-400">{move.name} ({lang === 'zh' ? '載入失敗' : 'failed'})</span>
              ) : d ? (
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{moveName}</span>
                    <TypeBadge type={d.type} size="sm" />
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_STYLE[d.category] || CATEGORY_STYLE.status}`}>
                      {catLabel[d.category] || d.category}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="mt-1.5 flex gap-4 text-xs text-gray-500">
                      <span>{lang === 'zh' ? '威力' : 'Power'}：<b className="text-gray-700">{d.power ?? '—'}</b></span>
                      <span>{lang === 'zh' ? '命中' : 'Acc'}：<b className="text-gray-700">{d.accuracy ?? '—'}</b></span>
                      <span>PP：<b className="text-gray-700">{d.pp}</b></span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-500">{move.name}</span>
              )}
            </button>
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
