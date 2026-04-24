import { useState, useMemo } from 'react';
import { usePokemonData } from '../../context/PokemonContext';
import TypeFilter from '../TypeFilter';
import TypeBadge from '../TypeBadge';
import { useLang } from '../../context/LangContext';
import { MEGA_SIGIL_URL } from '../../utils/constants';

export default function PokemonPicker({ onSelect, onClose }) {
  const { list } = usePokemonData();
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 text-lg leading-none"
        >✕</button>
        <h2 className="font-bold text-gray-800">
          {lang === 'zh' ? '選擇寶可夢' : 'Select Pokémon'}
        </h2>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length}</span>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'zh' ? '搜尋名稱...' : 'Search name...'}
          autoFocus
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <TypeFilter selected={typeFilter} onChange={setTypeFilter} maxSelect={2} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {lang === 'zh' ? '沒有符合條件的寶可夢' : 'No Pokémon found'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
            {filtered.map(p => (
              <PickerGridItem key={p.apiName} pokemon={p} lang={lang} onClick={() => onSelect(p)} />
            ))}
          </div>
        )}
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
      className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center gap-1.5
        hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-150 relative"
    >
      {pokemon.isMega && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
          <img src={MEGA_SIGIL_URL} alt="Mega" className="h-4 w-4" />
        </span>
      )}
      {pokemon.sprite
        ? <img src={pokemon.sprite} alt={pokemon.name} className="w-20 h-20 object-contain" loading="lazy" />
        : <div className="w-20 h-20 bg-gray-100 rounded-full" />
      }
      <p className="text-gray-400 text-xs leading-none">#{String(pokemon.id).padStart(4, '0')}</p>
      <p className="text-gray-800 text-sm font-semibold text-center leading-tight w-full truncate px-1">
        {displayName}
      </p>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </button>
  );
}
