import { useState, useRef, useEffect, useCallback } from 'react';
import { usePokemonList } from '../hooks/usePokemonList';
import { useLang } from '../context/LangContext';
import { MEGA_SIGIL_URL } from '../utils/constants';

const lv50Speed = (base) => base + 20;

// Spacer ≈ 40 % of the 72 vh drum container (≈ 28.8 vh).
// The mask's transparent zone (0–40 %) exactly covers the spacer,
// so the blank area is invisible while the first/last row can still scroll to centre.
const SPACER    = 'calc(72vh * 0.40)';
const DRUM_MASK = 'linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)';

export default function SpeedPage() {
  const { list, loadedCount, total } = usePokemonList();
  const { lang } = useLang();
  const zh = lang === 'zh';

  const scrollRef   = useRef(null);
  const rowRefs     = useRef([]);
  const hasScrolled = useRef(false);

  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(0);

  const isFullyLoaded = loadedCount >= total;

  /* ── Build rows ── */
  const groupMap = {};
  for (const p of list) {
    if (!p.loaded || p.unavailable || !p.stats?.length) continue;
    const base = p.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0;
    if (!groupMap[base]) groupMap[base] = [];
    groupMap[base].push(p);
  }
  const rows = Object.entries(groupMap)
    .map(([base, pokemon]) => ({ base: Number(base), lv50: lv50Speed(Number(base)), pokemon }))
    .sort((a, b) => b.base - a.base);

  /* ── Search — computed during render (no stale closure risk) ── */
  const term = search.trim().toLowerCase();
  const matchIndices = term
    ? rows.reduce((acc, row, i) => {
        const hit = row.pokemon.some(p => {
          const name = zh ? (p.zhName || p.enName || p.name) : (p.enName || p.zhName || p.name);
          return name?.toLowerCase().includes(term);
        });
        if (hit) acc.push(i);
        return acc;
      }, [])
    : [];

  const isSearchMatch = (p) => {
    if (!term) return false;
    const name = zh ? (p.zhName || p.enName || p.name) : (p.enName || p.zhName || p.name);
    return !!name?.toLowerCase().includes(term);
  };

  /* ── Name helpers ── */
  const getLine1 = (p) => {
    const baseName = zh ? (p.zhName || p.enName || p.name) : (p.enName || p.zhName || p.name);
    const megaSuffix = p.apiName?.includes('-mega-x') ? ' X' : p.apiName?.includes('-mega-y') ? ' Y' : '';
    if (p.isMega) return zh ? `超級${baseName}${megaSuffix}` : `Mega ${baseName}${megaSuffix}`;
    return baseName;
  };
  const getLine2 = (p) => {
    if (p.isMega) return null;
    return (zh ? p.variantLabel : (p.enLabel || p.variantLabel)) || null;
  };

  /* ── Scroll to row — getBoundingClientRect for accuracy ── */
  const scrollToRow = useCallback((rowIdx) => {
    const container = scrollRef.current;
    const el = rowRefs.current[rowIdx];
    if (!container || !el) return;
    const cRect  = container.getBoundingClientRect();
    const eRect  = el.getBoundingClientRect();
    const offset = eRect.top - cRect.top + el.offsetHeight / 2;
    const target = container.scrollTop + offset - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, []);

  /* ── Drum-roll + snap highlight ── */
  const applyTransforms = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const cRect   = container.getBoundingClientRect();
    const centerY = cRect.top + container.clientHeight / 2;
    const halfH   = container.clientHeight / 2;

    let closestIdx = -1, closestDist = Infinity;
    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(el.getBoundingClientRect().top + el.offsetHeight / 2 - centerY);
      if (d < closestDist) { closestDist = d; closestIdx = i; }
    });

    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      const dist = (el.getBoundingClientRect().top + el.offsetHeight / 2 - centerY) / halfH;
      const abs  = Math.abs(dist);
      // Gradual falloff: adjacent rows stay clearly visible, only distant edges dim
      el.style.transform       = `scale(${Math.max(0.68, 1 - abs * 0.20).toFixed(3)})`;
      el.style.opacity         = Math.max(0.45, 1 - abs * 0.18).toFixed(3);
      el.style.backgroundColor = i === closestIdx ? 'rgba(99,144,240,0.22)' : '';
      el.style.borderRadius    = i === closestIdx ? '12px' : '';
    });
  }, []);

  /* Auto-scroll: centre the fastest row on first load */
  useEffect(() => {
    if (hasScrolled.current || rows.length === 0) return;
    const t = setTimeout(() => {
      const container = scrollRef.current;
      const firstRow  = rowRefs.current[0];
      if (!container || !firstRow) return;
      const cRect  = container.getBoundingClientRect();
      const eRect  = firstRow.getBoundingClientRect();
      const offset = eRect.top - cRect.top + firstRow.offsetHeight / 2;
      container.scrollTop = Math.max(0, container.scrollTop + offset - container.clientHeight / 2);
      hasScrolled.current = true;
      applyTransforms();
    }, 100);
    return () => clearTimeout(t);
  }, [rows.length, applyTransforms]);

  /* Scroll listener */
  useEffect(() => {
    const t = setTimeout(applyTransforms, 60);
    const container = scrollRef.current;
    if (!container) return () => clearTimeout(t);
    container.addEventListener('scroll', applyTransforms, { passive: true });
    return () => { clearTimeout(t); container.removeEventListener('scroll', applyTransforms); };
  }, [rows.length, applyTransforms]);

  /* Jump to first match when search changes */
  const prevTerm = useRef('');
  useEffect(() => {
    if (term === prevTerm.current) return;
    prevTerm.current = term;
    setCursor(0);
    if (matchIndices.length > 0) scrollToRow(matchIndices[0]);
  });

  /* Enter: cycle through matches */
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' || matchIndices.length === 0) return;
    e.preventDefault();
    const next = (cursor + 1) % matchIndices.length;
    setCursor(next);
    scrollToRow(matchIndices[next]);
  };

  const hasSearch = term.length > 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-6">

        {/* Title row — search pushed to the right */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-0.5">
              {zh ? '速度排行' : 'Speed Timeline'}
            </h1>
            <p className="text-sm text-gray-400">
              {zh ? 'Lv50・31 IV・0 EV・無性格加成' : 'Lv50 · 31 IVs · 0 EVs · Neutral nature'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={zh ? '搜尋名稱…' : 'Search name…'}
                className="pl-8 pr-7 py-1.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent w-44"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {hasSearch && (
                <button onClick={() => { setSearch(''); setCursor(0); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-base leading-none">×</button>
              )}
            </div>
            {hasSearch && (
              <span className="text-xs text-gray-400 tabular-nums w-16 text-left">
                {matchIndices.length === 0
                  ? (zh ? '無結果' : 'No results')
                  : `${cursor + 1} / ${matchIndices.length}`}
              </span>
            )}
          </div>
        </div>

        {!isFullyLoaded && (
          <p className="text-xs text-blue-400 mb-4 tabular-nums">
            {zh ? `載入中 ${loadedCount} / ${total}…` : `Loading ${loadedCount} / ${total}…`}
          </p>
        )}

        {/* Drum wrapper */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

          {/* mask-image fades the drum's own pixels at top/bottom edges.
              No z-index overlay → centred rows are never dimmed by the fade. */}
          <div
            ref={scrollRef}
            className="bg-white overflow-y-scroll"
            style={{
              height: '72vh',
              maskImage: DRUM_MASK,
              WebkitMaskImage: DRUM_MASK,
            }}
          >

            {/* Top spacer — mask's transparent zone hides this, allows first row to reach centre */}
            <div style={{ height: SPACER }} />

            {rows.map((row, i) => (
              <div
                key={row.base}
                ref={el => { rowRefs.current[i] = el; }}
                className="flex items-center gap-4 px-5 py-3 will-change-transform"
                style={{ transformOrigin: 'center center' }}
              >
                <div className="shrink-0 w-16 text-right">
                  <p className="text-2xl font-black text-gray-800 tabular-nums leading-none">{row.lv50}</p>
                  <p className="text-[10px] text-gray-400 tabular-nums mt-0.5">base {row.base}</p>
                </div>
                <div className="shrink-0 w-px self-stretch bg-gray-200 my-1" />
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-4 flex-1 py-2">
                  {row.pokemon.map(p => {
                    const matched = isSearchMatch(p);
                    const line1 = getLine1(p);
                    const line2 = getLine2(p);
                    return (
                      <div key={p.apiName} className="flex flex-col items-center gap-1" style={{ minWidth: '80px' }}>
                        {/* Sprite — search match: borderless radial gradient circle */}
                        <div
                          className="relative w-20 h-20 shrink-0 rounded-full"
                          style={matched ? {
                            background: 'radial-gradient(circle at center, white 0%, rgba(255,237,0,0.90) 42%, rgba(255,230,0,0.18) 66%, transparent 82%)',
                          } : undefined}
                        >
                          {p.sprite
                            ? <img src={p.sprite} alt="" className="w-20 h-20 object-contain" loading="lazy" />
                            : <div className="w-20 h-20 bg-gray-100 rounded-full" />}
                          {p.isMega && (
                            <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <img src={MEGA_SIGIL_URL} alt="" className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 text-center whitespace-nowrap leading-tight">{line1}</p>
                        {line2 && <p className="text-[10px] text-gray-400 text-center whitespace-nowrap leading-tight">{line2}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom spacer — same size, allows last row to reach centre */}
            <div style={{ height: SPACER }} />

          </div>
        </div>

      </div>
    </div>
  );
}
