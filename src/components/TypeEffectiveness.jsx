import { TYPE_CHART, ALL_TYPES } from '../utils/constants';
import TypeBadge from './TypeBadge';

function singleEffectiveness(atk, def) {
  const chart = TYPE_CHART[def];
  if (!chart) return 1;
  if (chart.immuneTo.includes(atk)) return 0;
  if (chart.weakTo.includes(atk)) return 2;
  if (chart.resistantTo.includes(atk)) return 0.5;
  return 1;
}

function calcEffectiveness(atk, defTypes) {
  return defTypes.reduce((acc, def) => acc * singleEffectiveness(atk, def), 1);
}

const GROUPS = [
  { label: '×4 弱點',  value: 4,    bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-700' },
  { label: '×2 弱點',  value: 2,    bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  { label: '×½ 耐性',  value: 0.5,  bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700' },
  { label: '×¼ 耐性',  value: 0.25, bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
  { label: '×0 無效',  value: 0,    bg: 'bg-gray-100',  border: 'border-gray-300',   text: 'text-gray-600' },
];

const COMPACT_GROUPS = [
  { label: '×4', value: 4    },
  { label: '×2', value: 2    },
  { label: '½',  value: 0.5  },
  { label: '¼',  value: 0.25 },
  { label: '×0', value: 0    },
];

export default function TypeEffectiveness({ types, compact = false, horizontal = false }) {
  const defTypes = types.map(t => t.type.name);

  const map = {};
  ALL_TYPES.forEach(atk => {
    map[atk] = calcEffectiveness(atk, defTypes);
  });

  // Horizontal strip — between header and tabs, white background
  if (horizontal) {
    const hasAny = COMPACT_GROUPS.some(({ value }) => ALL_TYPES.some(t => map[t] === value));
    if (!hasAny) return null;
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
        {COMPACT_GROUPS.map(({ label, value }) => {
          const matched = ALL_TYPES.filter(t => map[t] === value);
          if (!matched.length) return null;
          const labelColor = value >= 2
            ? 'text-red-600'
            : value === 0
            ? 'text-gray-400'
            : 'text-blue-600';
          return (
            <div key={value} className="flex items-center gap-1.5">
              <span className={`text-base font-black shrink-0 w-7 text-right ${labelColor}`}>{label}</span>
              <div className="flex flex-wrap gap-1">
                {matched.map(t => <TypeBadge key={t} type={t} size="sm" />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Compact dark-bg version used in the card header
  if (compact) {
    const hasAny = COMPACT_GROUPS.some(({ value }) => ALL_TYPES.some(t => map[t] === value));
    return (
      <div>
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mb-2">屬性相剋</p>
        <div className="space-y-1.5">
          {COMPACT_GROUPS.map(({ label, value }) => {
            const matched = ALL_TYPES.filter(t => map[t] === value);
            if (matched.length === 0) return null;
            const labelColor = value >= 2 ? 'text-red-300' : value === 0 ? 'text-gray-400' : 'text-blue-300';
            return (
              <div key={value} className="flex items-start gap-1.5">
                <span className={`text-[10px] font-black shrink-0 w-5 text-right ${labelColor}`}>{label}</span>
                <div className="flex flex-wrap gap-0.5">
                  {matched.map(t => <TypeBadge key={t} type={t} size="xs" />)}
                </div>
              </div>
            );
          })}
          {!hasAny && <p className="text-[10px] text-white/30">無弱點/耐性</p>}
        </div>
      </div>
    );
  }

  // Full version used in standalone tab
  return (
    <div>
      <h3 className="text-base font-bold mb-3 text-gray-700">屬性相剋</h3>
      <div className="space-y-2">
        {GROUPS.map(({ label, value, bg, border, text }) => {
          const matched = ALL_TYPES.filter(t => map[t] === value);
          if (matched.length === 0) return null;
          return (
            <div key={value} className={`rounded-xl p-3 ${bg} border ${border}`}>
              <p className={`text-xs font-bold mb-1.5 ${text}`}>{label}</p>
              <div className="flex flex-wrap gap-1">
                {matched.map(t => <TypeBadge key={t} type={t} size="sm" />)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs font-bold text-gray-500 mb-1.5">×1 普通（無特效）</p>
        <div className="flex flex-wrap gap-1">
          {ALL_TYPES.filter(t => map[t] === 1).map(t => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
