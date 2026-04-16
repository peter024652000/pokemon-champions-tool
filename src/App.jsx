import { useState, useMemo } from 'react';
import { usePokemonList } from './hooks/usePokemonList';
import PokemonGridItem from './components/PokemonGridItem';
import PokemonModal from './components/PokemonModal';
import TypeFilter from './components/TypeFilter';

export default function App() {
  const { list, loadedCount, total } = usePokemonList();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const filtered = useMemo(() => {
    return list.filter(p => {
      if (!p.loaded || p.unavailable) return false;
      if (typeFilter.length > 0 && !typeFilter.every(t => p.types.includes(t))) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.includes(q) && !(p.zhName || '').includes(q)) return false;
      }
      return true;
    });
  }, [list, typeFilter, search]);

  const loadingDone = loadedCount >= total;
  const progress = total > 0 ? Math.round((loadedCount / total) * 100) : 0;
  const isFiltering = typeFilter.length > 0 || search;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-gray-800 shrink-0">寶可夢工具</h1>
            <span className="text-xs text-gray-400 shrink-0">Pokemon Champions</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋名稱..."
              className="ml-auto w-44 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <TypeFilter selected={typeFilter} onChange={setTypeFilter} />
        </div>

        {!loadingDone && (
          <div className="h-1 bg-gray-100">
            <div className="h-1 bg-blue-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        {filtered.length === 0 && loadingDone ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">沒有符合條件的寶可夢</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {loadingDone
                ? `共 ${filtered.length} 筆`
                : `載入中 ${loadedCount} / ${total}...`}
              {isFiltering && loadingDone && ` （篩選自 ${total} 筆）`}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {(isFiltering ? filtered : list).map((p, i) => (
                <PokemonGridItem
                  key={p.apiName || i}
                  pokemon={p}
                  onClick={setSelectedEntry}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedEntry && (
        <PokemonModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
