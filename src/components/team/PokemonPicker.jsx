import { useState, useMemo } from 'react';
import { usePokemonData } from '../../context/PokemonContext';
import TypeFilter from '../TypeFilter';
import TypeBadge from '../TypeBadge';
import { useLang } from '../../context/LangContext';
import { MEGA_SIGIL_URL } from '../../utils/constants';

export default function PokemonPicker({ onSelect, onClose, disabledApiNames = [] }) {
  const { list } = usePokemonData();
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);

  const filtered = useMemo(() => {
    return list.filter(p => {
      if (!p.loaded || p.unavailable) return false;
      if (p.isMega) return false;
      if (disabledApiNames.includes(p.apiName)) return false;
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
  }, [list, typeFilter, search, disabledApiNames]);

  return (
    /* Backdrop — click to close; centered on desktop, full-screen on mobile */
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col sm:items-center sm:justify-center sm:p-8"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="bg-white sm:rounded-[16px] shadow-clay-md w-full sm:max-w-4xl flex flex-col h-full sm:h-auto sm:max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-clay-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="text-clay-silver hover:text-clay-charcoal p-1 rounded-lg hover:bg-clay-oat text-lg leading-none transition-colors"
          >✕</button>
          <h2 className="font-bold text-clay-charcoal">
            {lang === 'zh' ? '選擇寶可夢' : 'Select Pokémon'}
          </h2>
          <span className="text-xs text-clay-silver ml-auto">{filtered.length}</span>
        </div>

        {/* Filters */}
        <div className="border-b border-clay-border px-4 py-3 space-y-2 shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'zh' ? '搜尋名稱...' : 'Search name...'}
            autoFocus
            className="w-full border border-clay-border rounded-[16px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-blue/30"
          />
          <TypeFilter selected={typeFilter} onChange={setTypeFilter} maxSelect={2} />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-clay-cream">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-clay-silver text-sm">
              {lang === 'zh' ? '沒有符合條件的寶可夢' : 'No Pokémon found'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
              {filtered.map(p => (
                <PickerGridItem key={p.apiName} pokemon={p} lang={lang} onClick={() => onSelect(p)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PickerGridItem({ pokemon, lang, onClick }) {
  const baseName = lang === 'zh'
    ? (pokemon.zhName || pokemon.enName || pokemon.name)
    : (pokemon.enName || pokemon.zhName || pokemon.name);

  const megaSuffix = pokemon.apiName?.includes('-mega-x') ? ' X'
    : pokemon.apiName?.includes('-mega-y') ? ' Y' : '';

  const variantLabel = lang === 'zh' ? pokemon.variantLabel : (pokemon.enLabel || pokemon.variantLabel);
  const displayName = pokemon.isMega
    ? (lang === 'zh' ? `超級${baseName}${megaSuffix}` : `Mega ${baseName}${megaSuffix}`)
    : variantLabel ? `${baseName} ${variantLabel}` : baseName;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-[16px] border border-clay-border p-2 flex flex-col items-center gap-1
        hover:shadow-clay-md hover:border-clay-blue/40 hover:-translate-y-0.5 transition-all duration-150 relative"
    >
      {pokemon.isMega && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shadow-clay">
          <img src={MEGA_SIGIL_URL} alt="Mega" className="h-3.5 w-3.5" />
        </span>
      )}
      {pokemon.sprite
        ? <img src={pokemon.sprite} alt={pokemon.name} className="w-16 h-16 object-contain" loading="lazy" />
        : <div className="w-16 h-16 bg-clay-oat rounded-full" />
      }
      <p className="text-clay-silver text-[10px] leading-none">#{String(pokemon.id).padStart(4, '0')}</p>
      <p className="text-clay-charcoal text-xs font-semibold text-center leading-tight w-full truncate px-0.5">
        {displayName}
      </p>
      <div className="flex gap-0.5 flex-wrap justify-center">
        {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="xs" />)}
      </div>
    </button>
  );
}
