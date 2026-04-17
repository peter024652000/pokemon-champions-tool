import { useState } from 'react';
import { STAT_NAMES_ZH, STAT_COLORS } from '../utils/constants';
import { calcStat, BP_MAX_PER_STAT, BP_TOTAL } from '../utils/calcStats';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_BAR_MAX = 400;

function getNatureMod(statName, nature) {
  if (!nature) return 1.0;
  if (nature.increased === statName) return 1.1;
  if (nature.decreased === statName) return 0.9;
  return 1.0;
}

export default function BaseStats({ stats, nature }) {
  const [bpAlloc, setBpAlloc] = useState(
    Object.fromEntries(STAT_ORDER.map(s => [s, 0]))
  );

  const usedBP = Object.values(bpAlloc).reduce((a, b) => a + b, 0);
  const remaining = BP_TOTAL - usedBP;

  function setBp(statName, val) {
    const parsed = Number.isNaN(val) ? 0 : val;
    const clamped = Math.max(0, Math.min(BP_MAX_PER_STAT, parsed));
    const delta = clamped - bpAlloc[statName];
    if (delta > 0 && delta > remaining) {
      const maxAllowed = bpAlloc[statName] + remaining;
      setBpAlloc(prev => ({ ...prev, [statName]: Math.min(BP_MAX_PER_STAT, maxAllowed) }));
      return;
    }
    setBpAlloc(prev => ({ ...prev, [statName]: clamped }));
  }

  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <div>
      {/* Title — md (24px) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-700">種族值</h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
          remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
        }`}>
          剩餘 BP {remaining} / {BP_TOTAL}
        </span>
      </div>

      <div className="space-y-3">
        {STAT_ORDER.map(statName => {
          const entry = stats.find(s => s.stat.name === statName);
          if (!entry) return null;
          const base = entry.base_stat;
          const bp = bpAlloc[statName];
          const mod = getNatureMod(statName, nature);
          const isHP = statName === 'hp';
          const calc = calcStat(base, bp, mod, isHP);
          const color = STAT_COLORS[statName] || '#888';
          const calcPct = Math.min((calc / STAT_BAR_MAX) * 100, 100);

          const natureUp = !isHP && mod > 1;
          const natureDown = !isHP && mod < 1;
          const calcColor = natureUp ? '#ef4444' : natureDown ? '#3b82f6' : color;

          return (
            <div key={statName} className="flex items-center gap-2">
              {/* Stat name — sm (16px) */}
              <span className="w-16 text-base text-gray-500 text-right shrink-0">
                {STAT_NAMES_ZH[statName] || statName}
              </span>

              {/* Lv50 calc value — sm (16px), colored */}
              <span className="w-12 text-base font-mono font-bold text-right shrink-0"
                style={{ color: calcColor }}>
                {calc}
              </span>

              {/* Progress bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-0">
                <div
                  className="h-3 rounded-full transition-all duration-150"
                  style={{ width: `${calcPct}%`, backgroundColor: color }}
                />
              </div>

              {/* Base stat — xs, gray reference */}
              <span className="w-9 text-sm font-mono text-gray-400 text-right shrink-0">
                {base}
              </span>

              {/* BP input — sm */}
              <input
                type="number"
                min={0}
                max={BP_MAX_PER_STAT}
                value={bp}
                onChange={e => setBp(statName, parseInt(e.target.value, 10))}
                className="w-14 text-base font-mono text-center border border-gray-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 shrink-0"
              />

              {/* ▲ button */}
              <button
                onClick={() => setBp(statName, bp + remaining)}
                disabled={remaining <= 0 || bp >= BP_MAX_PER_STAT}
                title="加到上限"
                className="text-sm font-bold w-8 h-7 rounded bg-blue-50 text-blue-500 hover:bg-blue-100 disabled:opacity-30 shrink-0 flex items-center justify-center"
              >▲</button>

              {/* ✕ button */}
              <button
                onClick={() => setBp(statName, 0)}
                disabled={bp === 0}
                title="歸零"
                className="text-sm font-bold w-8 h-7 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 shrink-0 flex items-center justify-center"
              >✕</button>
            </div>
          );
        })}

        <div className="flex items-center gap-2 border-t border-gray-200 pt-3 mt-1">
          <span className="w-16 text-base font-bold text-gray-600 text-right">合計</span>
          <span className="w-12 text-base font-mono font-black text-gray-900 text-right">{total}</span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-3 text-right">
        計算值 = Lv.50・個體值 31・{BP_MAX_PER_STAT} BP 上限　右側灰字為基礎種族值
      </p>
    </div>
  );
}
