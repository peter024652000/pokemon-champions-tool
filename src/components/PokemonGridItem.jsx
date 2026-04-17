import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';

export default function PokemonGridItem({ pokemon, onClick }) {
  const { lang } = useLang();

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

  return (
    <button
      onClick={() => onClick(pokemon)}
      className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col items-center gap-1
        hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-150 w-full text-left relative"
    >
      {pokemon.isMega && pokemon.variantLabel && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-purple-100 text-purple-600">
          {pokemon.variantLabel}
        </span>
      )}

      {pokemon.sprite
        ? <img src={pokemon.sprite} alt={pokemon.name} className="w-14 h-14 object-contain" loading="lazy" />
        : <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 text-lg">?</div>
      }
      <p className="text-gray-400 text-[10px] leading-none">#{String(pokemon.id).padStart(4, '0')}</p>
      <p className="text-gray-800 text-xs font-semibold leading-tight text-center w-full truncate px-1">
        {displayName}
      </p>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </button>
  );
}
