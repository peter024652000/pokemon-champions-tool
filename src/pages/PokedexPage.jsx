import { useState, useMemo } from 'react';
import { usePokemonData } from '../context/PokemonContext';
import PokemonGridItem from '../components/PokemonGridItem';
import TypeFilter from '../components/TypeFilter';
import { useLang } from '../context/LangContext';

export default function PokedexPage() {
  const { list, loadedCount, total } = usePokemonData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const [showMegaOnly, setShowMegaOnly] = useState(false);
  const { lang } = useLang();

  const filtered = useMemo(() => {
    return list.filter(p => {
      if (!p.loaded || p.unavailable) return false;
      if (showMegaOnly && !p.isMega) return false;
      if (typeFilter.length > 0 && !typeFilter.every(t => p.types.includes(t))) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const zhMatch = (p.zhName || '').includes(q);
        const enMatch = (p.enName || '').toLowerCase().includes(q);
        if (!nameMatch && !zhMatch && !enMatch) return false;
      }
      return true;
    });
  }, [list, typeFilter, search, showMegaOnly]);

  const loadingDone = loadedCount >= total;
  const progress = total > 0 ? Math.round((loadedCount / total) * 100) : 0;
  const isFiltering = typeFilter.length > 0 || search || showMegaOnly;

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-14 z-40 bg-white border-b border-clay-border shadow-clay-nav">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-3 space-y-2.5">
          {/* Search — centered */}
          <div className="flex justify-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'zh' ? '搜尋名稱...' : 'Search name...'}
              className="w-full max-w-md border border-clay-border rounded-[16px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
            />
          </div>

          {/* Type filter + Mega toggle */}
          <TypeFilter
            selected={typeFilter}
            onChange={setTypeFilter}
            maxSelect={2}
            showMega={showMegaOnly}
            onMegaChange={setShowMegaOnly}
          />
        </div>

        {!loadingDone && (
          <div className="h-1 bg-clay-oat">
            <div
              className="h-1 bg-clay-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-4">
        {filtered.length === 0 && loadingDone ? (
          <div className="text-center py-20 text-clay-silver">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">
              {lang === 'zh' ? '沒有符合條件的寶可夢' : 'No Pokémon found'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-clay-silver mb-3">
              {loadingDone
                ? `${lang === 'zh' ? '共' : 'Total'} ${filtered.length}${lang === 'zh' ? ' 筆' : ''}`
                : `${lang === 'zh' ? '載入中' : 'Loading'} ${loadedCount} / ${total}...`}
              {isFiltering && loadingDone && (lang === 'zh' ? ` （篩選自 ${total} 筆）` : ` (of ${total})`)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
              {filtered.map((p, i) => (
                <PokemonGridItem key={p.apiName || i} pokemon={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
