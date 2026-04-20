import { useState, useRef } from 'react';
import TypeBadge from './TypeBadge';
import { useLang } from '../context/LangContext';
import moveData from '../data/move-data.json';
import moveEffects from '../data/move-effects.json';

// ── Category icons (inline SVG) ─────────────────────────────────────────────
function PhysicalIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <circle cx="10" cy="10" r="9" fill="#F97316" opacity="0.15" />
      <path d="M6 10 C6 7.8 7.8 6 10 6 L13 6 L13 8 L10 8 C8.9 8 8 8.9 8 10 C8 11.1 8.9 12 10 12 L13 12 L13 14 L10 14 C7.8 14 6 12.2 6 10Z" fill="#C2410C" />
      <path d="M12 7 L15 10 L12 13" stroke="#C2410C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpecialIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <circle cx="10" cy="10" r="9" fill="#3B82F6" opacity="0.15" />
      <path d="M10 4 L11.5 8.5 L16 8.5 L12.5 11.2 L13.8 16 L10 13 L6.2 16 L7.5 11.2 L4 8.5 L8.5 8.5 Z" fill="#1D4ED8" />
    </svg>
  );
}

function StatusIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="9" fill="#6B7280" opacity="0.12" />
      <circle cx="10" cy="10" r="3.5" stroke="#6B7280" strokeWidth="1.5" />
      <path d="M10 4 C7 4 4.5 6.5 4.5 10" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 16 C13 16 15.5 13.5 15.5 10" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_CONFIG = {
  physical: {
    icon: PhysicalIcon,
    zh: '物理', en: 'Physical',
    textClass: 'text-orange-700',
  },
  special: {
    icon: SpecialIcon,
    zh: '特殊', en: 'Special',
    textClass: 'text-blue-700',
  },
  status: {
    icon: StatusIcon,
    zh: '變化', en: 'Status',
    textClass: 'text-gray-500',
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function getMoveName(slug, lang) {
  const d = moveData[slug];
  if (!d) return slug;
  return lang === 'zh' ? (d.zh || d.en || slug) : (d.en || slug);
}

function getEffectText(slug, lang) {
  const d = moveData[slug];
  if (!d?.effectId) return null;
  const entry = moveEffects[String(d.effectId)];
  if (!entry) return null;
  const raw = lang === 'zh' ? (entry.zh || entry.en) : (entry.en || entry.zh);
  if (!raw) return null;
  return raw.replace(/\$effect_chance%/g, (d.effectChance || '?') + '%');
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function MoveList({ moves }) {
  const [search, setSearch] = useState('');
  const [hoveredMove, setHoveredMove] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tableRef = useRef(null);
  const { lang } = useLang();
  const zh = lang === 'zh';

  // Build unique sorted list of move slugs from prop
  const allSlugs = [...new Set(moves.map(m => m.move.name))];

  // Filter by search
  const term = search.trim().toLowerCase();
  const filtered = allSlugs.filter(slug => {
    if (!term) return true;
    const d = moveData[slug];
    return (
      slug.includes(term) ||
      (d?.zh && d.zh.includes(term)) ||
      (d?.en && d.en.toLowerCase().includes(term))
    );
  });

  // Sort: by category (physical → special → status), then by power desc, then name
  const CATEGORY_ORDER = { physical: 0, special: 1, status: 2 };
  filtered.sort((a, b) => {
    const da = moveData[a], db = moveData[b];
    const catA = CATEGORY_ORDER[da?.category] ?? 3;
    const catB = CATEGORY_ORDER[db?.category] ?? 3;
    if (catA !== catB) return catA - catB;
    const pwrA = da?.power ?? -1;
    const pwrB = db?.power ?? -1;
    if (pwrB !== pwrA) return pwrB - pwrA;
    return getMoveName(a, lang).localeCompare(getMoveName(b, lang));
  });

  function handleRowMouseEnter(e, slug) {
    setHoveredMove(slug);
    const row = e.currentTarget;
    const table = tableRef.current;
    if (table) {
      const rRect = row.getBoundingClientRect();
      const tRect = table.getBoundingClientRect();
      setTooltipPos({
        top: rRect.bottom - tRect.top + table.scrollTop + 4,
        left: 0,
      });
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-700">
            {zh ? '可學招式' : 'Learnable Moves'}
          </h3>
          <p className="text-sm text-gray-400">
            {zh ? `共 ${allSlugs.length} 招` : `${allSlugs.length} moves`}
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={zh ? '搜尋招式...' : 'Search moves...'}
          className="w-44 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Table */}
      <div ref={tableRef} className="relative max-h-[520px] overflow-y-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-500 w-[36%]">
                {zh ? '招式名稱' : 'Move'}
              </th>
              <th className="text-left px-2 py-2.5 font-semibold text-gray-500 w-[15%]">
                {zh ? '屬性' : 'Type'}
              </th>
              <th className="text-left px-2 py-2.5 font-semibold text-gray-500 w-[16%]">
                {zh ? '類別' : 'Category'}
              </th>
              <th className="text-center px-2 py-2.5 font-semibold text-gray-500 w-[11%]">
                {zh ? '威力' : 'Power'}
              </th>
              <th className="text-center px-2 py-2.5 font-semibold text-gray-500 w-[11%]">
                {zh ? '命中' : 'Acc'}
              </th>
              <th className="text-center px-2 py-2.5 font-semibold text-gray-500 w-[11%]">
                PP
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((slug, idx) => {
              const d = moveData[slug];
              const name = getMoveName(slug, lang);
              const cat = CATEGORY_CONFIG[d?.category];
              const CatIcon = cat?.icon;
              const effectText = getEffectText(slug, lang);
              const isHovered = hoveredMove === slug;

              return (
                <tr
                  key={slug}
                  onMouseEnter={e => handleRowMouseEnter(e, slug)}
                  onMouseLeave={() => setHoveredMove(null)}
                  className={`border-b border-gray-100 last:border-0 transition-colors cursor-default
                    ${isHovered ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  {/* Name */}
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-gray-800">{name}</span>
                    {isHovered && effectText && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xs">
                        {effectText}
                      </p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-2 py-2.5">
                    {d?.type ? <TypeBadge type={d.type} size="xs" /> : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Category */}
                  <td className="px-2 py-2.5">
                    {cat ? (
                      <span className={`inline-flex items-center gap-1 font-semibold ${cat.textClass}`}>
                        <CatIcon className="w-4 h-4 shrink-0" />
                        {zh ? cat.zh : cat.en}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Power */}
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {d?.power != null
                      ? <span className="font-bold text-gray-700">{d.power}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Accuracy */}
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {d?.accuracy != null
                      ? <span className="text-gray-600">{d.accuracy}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>

                  {/* PP */}
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {d?.pp != null
                      ? <span className="text-gray-500">{d.pp}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  {zh ? '沒有符合的招式' : 'No moves found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
