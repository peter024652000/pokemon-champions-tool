import TypeBadge from '../TypeBadge';
import { useLang } from '../../context/LangContext';
import { STAT_NAMES_ZH, STAT_COLORS, MEGA_SIGIL_URL, NATURES } from '../../utils/constants';
import { calcStat } from '../../utils/calcStats';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_BAR_MAX = 250;

function getNatureMod(statName, nature) {
  if (!nature || statName === 'hp') return 1.0;
  if (nature.increased === statName) return 1.1;
  if (nature.decreased === statName) return 0.9;
  return 1.0;
}

export default function StatusView({ slot }) {
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

  const nature = NATURES.find(n => n.en === slot.nature) || null;

  if (!slot.stats || slot.stats.length === 0) {
    return (
      <div className="h-full flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {slot.sprite && <img src={slot.sprite} alt="" className="w-10 h-10 object-contain shrink-0" />}
          <span className="text-sm font-bold text-clay-charcoal truncate">{fullName}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-xs text-clay-border">
          {lang === 'zh' ? '載入中...' : 'Loading...'}
        </div>
      </div>
    );
  }

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
            <span className="text-sm font-bold text-clay-charcoal truncate leading-tight">{fullName}</span>
          </div>
          <div className="flex gap-0.5 flex-wrap mt-0.5">
            {slot.types?.map(t => <TypeBadge key={t} type={t} size="xs" />)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1 flex-1">
        {STAT_ORDER.map(statName => {
          const entry = slot.stats.find(s => s.stat.name === statName);
          if (!entry) return null;
          const base = entry.base_stat;
          const bp = slot.bp?.[statName] ?? 0;
          const mod = getNatureMod(statName, nature);
          const isHP = statName === 'hp';
          const calc = calcStat(base, bp, mod, isHP);
          const barPct = Math.min((calc / STAT_BAR_MAX) * 100, 100);
          const color = STAT_COLORS[statName] || '#888';
          const natureUp = !isHP && mod > 1;
          const natureDown = !isHP && mod < 1;

          return (
            <div key={statName} className="flex items-center gap-1.5">
              <span className={`w-10 text-right text-[11px] font-medium shrink-0 ${
                natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-clay-silver'
              }`}>
                {STAT_NAMES_ZH[statName]}{natureUp ? '↑' : natureDown ? '↓' : ''}
              </span>
              <span className={`w-8 text-right font-mono font-bold text-xs shrink-0 ${
                natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-clay-charcoal'
              }`}>
                {calc}
              </span>
              <div className="flex-1 bg-clay-border/40 rounded-full h-1.5 min-w-0">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${barPct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[11px] text-clay-silver shrink-0 font-mono whitespace-nowrap">
                {base}<span className="text-clay-border mx-0.5">—</span>{bp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
