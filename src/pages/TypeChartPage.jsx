import { useState } from 'react';
import { TYPE_CHART, ALL_TYPES, TYPE_NAMES_ZH, TYPE_COLORS, TYPE_ICON_BASE } from '../utils/constants';
import TypeBadge from '../components/TypeBadge';
import { useLang } from '../context/LangContext';

function singleEff(atk, def) {
  const chart = TYPE_CHART[def];
  if (!chart) return 1;
  if (chart.immuneTo.includes(atk)) return 0;
  if (chart.weakTo.includes(atk)) return 2;
  if (chart.resistantTo.includes(atk)) return 0.5;
  return 1;
}

const EFF_LABELS = [
  { value: 4,    zh: '×4　效果絕佳無比',  en: '×4　Devastating',         textClass: 'text-gray-700' },
  { value: 2,    zh: '×2　效果較佳',      en: '×2　Super effective',      textClass: 'text-gray-700' },
  { value: 1,    zh: '×1　有效果',        en: '×1　Normal',               textClass: 'text-gray-500' },
  { value: 0.5,  zh: '×½　效果不佳',     en: '×½　Not very effective',   textClass: 'text-gray-500' },
  { value: 0.25, zh: '×¼　效果極度不佳', en: '×¼　Barely effective',     textClass: 'text-gray-500' },
  { value: 0,    zh: '×0　沒有效果',     en: '×0　No effect',            textClass: 'text-gray-400' },
];

function EffRow({ effLabel, types, lang }) {
  if (types.length === 0) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-200">
      <p className={`text-xs font-bold mb-1.5 tabular-nums ${effLabel.textClass}`}>
        {lang === 'zh' ? effLabel.zh : effLabel.en}
      </p>
      <div className="flex flex-wrap gap-1">
        {types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </div>
  );
}

function SwordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function TypeChartPage() {
  const { lang } = useLang();
  const zh = lang === 'zh';
  const [selected, setSelected] = useState(null);

  const offMap = selected
    ? Object.fromEntries(ALL_TYPES.map(def => [def, singleEff(selected, def)]))
    : null;

  const defMap = selected
    ? Object.fromEntries(ALL_TYPES.map(atk => [atk, singleEff(atk, selected)]))
    : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-6">

        {/* Page title */}
        <h1 className="text-2xl font-black text-gray-800 mb-1">
          {zh ? '屬性相剋表' : 'Type Chart'}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {zh ? '選擇一個屬性，查看攻擊與防守的相剋關係' : 'Select a type to view offensive and defensive matchups'}
        </p>

        {/* ── Type selector: 2 rows × 9 cols, pill buttons ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-9 gap-x-3 gap-y-3">
            {ALL_TYPES.map(type => {
              const active = selected === type;
              const label = zh ? TYPE_NAMES_ZH[type] : type.charAt(0).toUpperCase() + type.slice(1);
              return (
                <button
                  key={type}
                  onClick={() => setSelected(active ? null : type)}
                  className={`w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-xs font-bold transition-all
                    ${active
                      ? 'text-white shadow-lg scale-105'
                      : 'text-white/60 hover:text-white/90 hover:scale-[1.03]'
                    }`}
                  style={{
                    backgroundColor: TYPE_COLORS[type],
                    boxShadow: active
                      ? `0 0 0 3px white, 0 0 0 5px ${TYPE_COLORS[type]}`
                      : undefined,
                  }}
                >
                  <img src={`${TYPE_ICON_BASE}${type}.png`} alt="" className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Matchup panels ── */}
        {selected ? (
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">

            {/* Offense panel */}
            <div className="flex-1 w-full bg-white rounded-2xl border-2 border-red-300 shadow-sm overflow-hidden">
              <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none mb-1">
                    {zh ? '攻擊面' : 'Offense'}
                  </p>
                  <h2 className="text-sm font-black text-gray-800 leading-none">
                    {zh ? '作為攻擊方' : 'As the attacker'}
                  </h2>
                </div>
                <SwordIcon className="w-7 h-7 text-red-400 shrink-0" />
              </div>
              <div className="p-4 space-y-2">
                {EFF_LABELS.map(eff => (
                  <EffRow key={eff.value} effLabel={eff}
                    types={ALL_TYPES.filter(t => offMap[t] === eff.value)} lang={lang} />
                ))}
              </div>
            </div>

            {/* Centre: selected type */}
            <div className="hidden sm:flex flex-col items-center justify-center gap-2 shrink-0 w-20">
              <img
                src={`${TYPE_ICON_BASE}${selected}.png`}
                alt=""
                className="w-14 h-14 drop-shadow-md"
              />
              <TypeBadge type={selected} size="sm" />
            </div>

            {/* Defense panel */}
            <div className="flex-1 w-full bg-white rounded-2xl border-2 border-blue-300 shadow-sm overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">
                    {zh ? '防守面' : 'Defense'}
                  </p>
                  <h2 className="text-sm font-black text-gray-800 leading-none">
                    {zh ? '作為防守方' : 'As the defender'}
                  </h2>
                </div>
                <ShieldIcon className="w-7 h-7 text-blue-400 shrink-0" />
              </div>
              <div className="p-4 space-y-2">
                {EFF_LABELS.map(eff => (
                  <EffRow key={eff.value} effLabel={eff}
                    types={ALL_TYPES.filter(t => defMap[t] === eff.value)} lang={lang} />
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">⚡</p>
            <p className="text-sm">{zh ? '請選擇一個屬性' : 'Select a type above'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
