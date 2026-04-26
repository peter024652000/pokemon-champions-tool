import { useState } from 'react';
import TypeBadge from '../TypeBadge';
import { useLang } from '../../context/LangContext';
import { TYPE_COLORS, TYPE_ICON_BASE, MEGA_SIGIL_URL, ITEM_SPRITE_BASE } from '../../utils/constants';
import abilityData from '../../data/ability-data.json';
import moveData from '../../data/move-data.json';
import itemData from '../../data/item-data.json';

const SEREBII_ITEM_BASE = 'https://www.serebii.net/itemdex/sprites/';

function ItemSprite({ slug, category }) {
  const [src, setSrc] = useState(`${ITEM_SPRITE_BASE}${slug}.png`);
  const [failed, setFailed] = useState(false);
  function handleError() {
    if (src.startsWith(ITEM_SPRITE_BASE)) {
      setSrc(`${SEREBII_ITEM_BASE}${slug}.png`);
    } else {
      setFailed(true);
    }
  }
  if (failed) {
    if (category === 'MEGA_STONE') {
      return <img src={MEGA_SIGIL_URL} alt="" className="w-4 h-4 object-contain shrink-0 opacity-60" />;
    }
    return <span className="w-4 h-4 shrink-0 rounded bg-clay-border/30 flex items-center justify-center text-[9px] text-clay-silver">?</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className="w-4 h-4 object-contain shrink-0"
      onError={handleError}
    />
  );
}

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
    <div className="h-full flex flex-col gap-2.5">
      {/* Pokemon header: sprite + name + types on same line */}
      <div className="flex items-center gap-2">
        {slot.sprite && (
          <img
            src={slot.sprite}
            alt=""
            className="w-11 h-11 object-contain shrink-0"
            onError={slot.spriteFallback ? e => { e.currentTarget.src = slot.spriteFallback; e.currentTarget.onerror = null; } : undefined}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap leading-tight">
            {slot.isMega && <img src={MEGA_SIGIL_URL} alt="Mega" className="h-3.5 w-3.5 shrink-0" />}
            <span className="text-sm font-bold text-clay-charcoal">{fullName}</span>
            {slot.types?.map(t => <TypeBadge key={t} type={t} size="xs" />)}
          </div>
        </div>
      </div>

      {/* Ability & Item */}
      <div className="text-xs space-y-1">
        <div className="flex gap-1.5">
          <span className="text-clay-silver shrink-0">{lang === 'zh' ? '特性' : 'Ability'}:</span>
          <span className="font-semibold text-clay-charcoal truncate">{abilityName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-clay-silver shrink-0">{lang === 'zh' ? '道具' : 'Item'}:</span>
          {slot.heldItem && itemData[slot.heldItem] ? (
            <>
              <ItemSprite slug={slot.heldItem} category={itemData[slot.heldItem].category} />
              <span className="font-semibold text-clay-charcoal truncate">
                {lang === 'zh' ? (itemData[slot.heldItem].zh || itemData[slot.heldItem].en) : (itemData[slot.heldItem].en || itemData[slot.heldItem].zh)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-clay-charcoal truncate">{slot.heldItem || '—'}</span>
          )}
        </div>
      </div>

      {/* Moves */}
      <div className="grid grid-cols-2 gap-1.5 flex-1 content-start">
        {(slot.selectedMoves || [null, null, null, null]).map((slug, i) => {
          const d = slug ? moveData[slug] : null;
          const moveName = d ? (lang === 'zh' ? (d.zh || d.en) : (d.en || d.zh)) : null;
          const color = d ? (TYPE_COLORS[d.type] || '#888') : null;
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-2 py-2 rounded-[12px] border ${
                d ? 'bg-white border-clay-border' : 'bg-clay-oat border-dashed border-clay-border/60'
              }`}
            >
              {d ? (
                <>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <img src={`${TYPE_ICON_BASE}${d.type}.png`} alt="" className="h-3 w-3" />
                  </span>
                  <span className="text-xs font-semibold text-clay-charcoal truncate">{moveName}</span>
                </>
              ) : (
                <span className="text-xs text-clay-border">
                  {lang === 'zh' ? `招式 ${i + 1}` : `Move ${i + 1}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
