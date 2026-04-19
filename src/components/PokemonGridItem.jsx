import { useNavigate, useLocation } from 'react-router-dom';
import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';
import { MEGA_SIGIL_URL } from '../utils/constants';

export default function PokemonGridItem({ pokemon }) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render unavailable entries (e.g. Z-A megas not yet in PokeAPI)
  if (pokemon.unavailable) return null;

  if (!pokemon.loaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col items-center gap-1.5 animate-pulse">
        <div className="w-14 h-14 bg-gray-200 rounded-full" />
        <div className="w-8 h-2 bg-gray-200 rounded" />
        <div className="w-14 h-3 bg-gray-200 rounded" />
        <div className="w-10 h-4 bg-gray-100 rounded-full" />
      </div>
    );
  }

  // Choose name based on language
  const baseName = lang === 'zh'
    ? (pokemon.zhName || pokemon.enName || pokemon.name)
    : (pokemon.enName || pokemon.zhName || pokemon.name);

  // X/Y suffix for dual Mega forms (e.g. Charizard)
  const megaSuffix = pokemon.apiName?.includes('-mega-x') ? ' X'
    : pokemon.apiName?.includes('-mega-y') ? ' Y' : '';

  // Mega: show full Mega name. Other variants: append label to name.
  const variantLabel = lang === 'zh' ? pokemon.variantLabel : (pokemon.enLabel || pokemon.variantLabel);
  const displayName = pokemon.isMega
    ? (lang === 'zh' ? `超級${baseName}${megaSuffix}` : `Mega ${baseName}${megaSuffix}`)
    : variantLabel
      ? `${baseName} ${variantLabel}`
      : baseName;

  function handleClick() {
    navigate(`/pokemon/${pokemon.apiName}`, {
      state: { background: location, entry: pokemon },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center gap-1.5
        hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-150 w-full text-left relative"
    >
      {pokemon.isMega && (
        <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
          <img src={MEGA_SIGIL_URL} alt="Mega" className="h-5 w-5" />
        </span>
      )}

      {pokemon.sprite
        ? <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-20 h-20 object-contain"
            loading="lazy"
            onError={pokemon.spriteFallback ? (e) => { e.currentTarget.src = pokemon.spriteFallback; e.currentTarget.onerror = null; } : undefined}
          />
        : <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 text-2xl">?</div>
      }
      <p className="text-gray-400 text-xs leading-none">#{String(pokemon.id).padStart(4, '0')}</p>
      <p className="text-gray-800 text-base font-semibold leading-tight text-center w-full truncate px-1">
        {displayName}
      </p>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </button>
  );
}
