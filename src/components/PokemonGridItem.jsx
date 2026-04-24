import { useNavigate } from 'react-router-dom';
import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';
import { MEGA_SIGIL_URL } from '../utils/constants';

export default function PokemonGridItem({ pokemon }) {
  const { lang } = useLang();
  const navigate = useNavigate();

  // Don't render unavailable entries (e.g. Z-A megas not yet in PokeAPI)
  if (pokemon.unavailable) return null;

  if (!pokemon.loaded) {
    return (
      <div className="bg-white rounded-[16px] border border-clay-border p-2 flex flex-col items-center gap-1.5 animate-pulse">
        <div className="w-14 h-14 bg-clay-border rounded-full" />
        <div className="w-8 h-2 bg-clay-border rounded" />
        <div className="w-14 h-3 bg-clay-border rounded" />
        <div className="w-10 h-4 bg-clay-oat rounded-full" />
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
      state: { entry: pokemon },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-[16px] border border-clay-border p-3 flex flex-col items-center gap-1.5
        shadow-clay hover:shadow-clay-md hover:border-clay-blue/40 hover:-translate-y-0.5 transition-all duration-150 w-full text-left relative"
    >
      {pokemon.isMega && (
        <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shadow-clay">
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
        : <div className="w-20 h-20 bg-clay-oat rounded-full flex items-center justify-center text-clay-border text-2xl">?</div>
      }
      <p className="text-clay-silver text-xs leading-none">#{String(pokemon.id).padStart(4, '0')}</p>
      <p className="text-clay-charcoal text-base font-semibold leading-tight text-center w-full truncate px-1">
        {displayName}
      </p>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types?.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </button>
  );
}
