import TypeBadge from '../TypeBadge';
import { useLang } from '../../context/LangContext';
import { TYPE_COLORS, TYPE_ICON_BASE, MEGA_SIGIL_URL } from '../../utils/constants';
import abilityData from '../../data/ability-data.json';
import moveData from '../../data/move-data.json';

const CATEGORY_ICON_BASE = 'https://img.pokemondb.net/images/icons/move-';

export default function AbilityView({ slot }) {
  const { lang } = useLang();

  const displayName = lang === 'zh'
    ? (slot.zhName || slot.enName)
    : (slot.enName || slot.zhName);
  const megaSuffix = slot.apiName?.includes('-mega-x') ? ' X'
    : slot.apiName?.includes('-mega-y') ? ' Y' : '';
  const variantLabel = lang === 'zh' ? slot.variantLabel : (slot.enLabel || slot.variantLabel);
  const fullName = slot.isMega
    ? (lang === 'zh' ? `超級${displayName}${megaSuffix}` : `Mega ${displayName}${megaSuffix}`)
    : variantLabel ? `${displayName} ${variantLabel}` : displayName;

  const abilityEntry = slot.selectedAbility ? abilityData[slot.selectedAbility] : null;
  const abilityName = abilityEntry
    ? (lang === 'zh' ? (abilityEntry.zh || abilityEntry.en) : (abilityEntry.en || abilityEntry.zh))
    : (slot.selectedAbility || '—');

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Pokemon header */}
      <div className="flex items-center gap-2">
        {slot.sprite && (
          <img
            src={slot.sprite}
            alt=""
            className="w-10 h-10 object-contain shrink-0"
            onError={slot.spriteFallback ? e => { e.currentTarget.src = slot.spriteFallback; e.currentTarget.onerror = null; } : undefined}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {slot.isMega && <img src={MEGA_SIGIL_URL} alt="Mega" className="h-3.5 w-3.5" />}
            <span className="text-sm font-bold text-gray-900 truncate leading-tight">{fullName}</span>
          </div>
          <div className="flex gap-0.5 flex-wrap mt-0.5">
            {slot.types?.map(t => <TypeBadge key={t} type={t} size="xs" />)}
          </div>
        </div>
      </div>

      {/* Ability & Item */}
      <div className="text-xs space-y-0.5">
        <div className="flex gap-1.5">
          <span className="text-gray-400 shrink-0">{lang === 'zh' ? '特性' : 'Ability'}:</span>
          <span className="font-semibold text-gray-700 truncate">{abilityName}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="text-gray-400 shrink-0">{lang === 'zh' ? '道具' : 'Item'}:</span>
          <span className="font-semibold text-gray-700 truncate">{slot.heldItem || '—'}</span>
        </div>
      </div>

      {/* Moves */}
      <div className="grid grid-cols-2 gap-1 flex-1 content-start">
        {(slot.selectedMoves || [null, null, null, null]).map((slug, i) => {
          const d = slug ? moveData[slug] : null;
          const moveName = d ? (lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh)) : null;
          const color = d ? (TYPE_COLORS[d.type] || '#888') : null;
          return (
            <div
              key={i}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs ${
                d ? 'bg-white border border-gray-100' : 'bg-gray-50 text-gray-300'
              }`}
              style={d ? { borderLeft: `3px solid ${color}` } : {}}
            >
              {d && (
                <>
                  <img src={`${TYPE_ICON_BASE}${d.type}.png`} alt="" className="h-3 w-3 shrink-0" />
                  <img src={`${CATEGORY_ICON_BASE}${d.category}.png`} alt="" className="h-3.5 w-auto shrink-0" />
                </>
              )}
              <span className={`truncate ${d ? 'text-gray-800 font-medium' : ''}`}>
                {moveName || '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
