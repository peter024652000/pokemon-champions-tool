import { useState, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { usePokemonList } from './hooks/usePokemonList';
import PokemonGridItem from './components/PokemonGridItem';
import PokemonModal from './components/PokemonModal';
import TypeFilter from './components/TypeFilter';
import { LangProvider, useLang } from './context/LangContext';
import PokemonDetailPage from './pages/PokemonDetailPage';

function ListPage() {
  const { list, loadedCount, total } = usePokemonList();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const { lang, setLang } = useLang();

  const filtered = useMemo(() => {
    return list.filter(p => {
      if (!p.loaded || p.unavailable) return false;
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
  }, [list, typeFilter, search]);

  const loadingDone = loadedCount >= total;
  const progress = total > 0 ? Math.round((loadedCount / total) * 100) : 0;
  const isFiltering = typeFilter.length > 0 || search;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 py-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-800 shrink-0">寶可夢工具</h1>
            <span className="text-xs text-gray-400 shrink-0">Pokemon Champions</span>
            {/* Language toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 text-base font-semibold transition-colors ${
                  lang === 'zh' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >中文</button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-base font-semibold transition-colors border-l border-gray-200 ${
                  lang === 'en' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >EN</button>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'zh' ? '搜尋名稱...' : 'Search name...'}
              className="ml-auto w-52 border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
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
      <div className="max-w-screen-2xl mx-auto px-3 py-4">
        {filtered.length === 0 && loadingDone ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">{lang === 'zh' ? '沒有符合條件的寶可夢' : 'No Pokémon found'}</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {loadingDone
                ? `${lang === 'zh' ? '共' : 'Total'} ${filtered.length} ${lang === 'zh' ? '筆' : ''}`
                : `${lang === 'zh' ? '載入中' : 'Loading'} ${loadedCount} / ${total}...`}
              {isFiltering && loadingDone && (lang === 'zh' ? ` （篩選自 ${total} 筆）` : ` (of ${total})`)}
            </p>
            <div className="grid grid-cols-8 gap-2">
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

function AppRouter() {
  const location = useLocation();
  // background is set when navigating from the list → show list behind + modal on top
  const background = location.state?.background;

  return (
    <>
      {/* Main routes — render list at background location when overlay is open */}
      <Routes location={background || location}>
        <Route path="/" element={<ListPage />} />
        <Route path="/pokemon/:apiName" element={<PokemonDetailPage />} />
      </Routes>

      {/* Overlay modal — only rendered when there's a background (i.e. navigated from list) */}
      {background && (
        <Routes>
          <Route path="/pokemon/:apiName" element={<PokemonModal />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppRouter />
    </LangProvider>
  );
}
