import { useState } from 'react';
import { STAT_NAMES_ZH, STAT_COLORS } from '../utils/constants';
import { calcStat, BP_MAX_PER_STAT, BP_TOTAL } from '../utils/calcStats';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

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
    const clamped = Math.max(0, Math.min(BP_MAX_PER_STAT, val));
    const delta = clamped - bpAlloc[statName];
    if (delta > 0 && delta > remaining) return; // would exceed total
    setBpAlloc(prev => ({ ...prev, [statName]: clamped }));
  }

  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-700">種族值</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
        }`}>
          剩餘 BP {remaining} / {BP_TOTAL}
        </span>
      </div>

      <div className="space-y-2">
        {STAT_ORDER.map(statName => {
          const entry = stats.find(s => s.stat.name === statName);
          if (!entry) return null;
          const base = entry.base_stat;
          const bp = bpAlloc[statName];
          const mod = getNatureMod(statName, nature);
          const isHP = statName === 'hp';
          const calc = calcStat(base, bp, mod, isHP);
          const color = STAT_COLORS[statName] || '#888';
          const pct = Math.min((base / 255) * 100, 100);

          const natureUp = !isHP && mod > 1;
          const natureDown = !isHP && mod < 1;

          return (
            <div key={statName} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-12 text-xs text-gray-500 text-right shrink-0">
                  {STAT_NAMES_ZH[statName] || statName}
                </span>
                <span className="w-8 text-xs font-mono text-gray-600 text-right shrink-0">
                  {base}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                {/* BP controls */}
                <button
                  onClick={() => setBp(statName, bp - 1)}
                  disabled={bp === 0}
                  className="w-5 h-5 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center shrink-0 leading-none"
                >−</button>
                <span className="w-5 text-xs font-mono text-center text-gray-700 shrink-0">{bp}</span>
                <button
                  onClick={() => setBp(statName, bp + 1)}
                  disabled={bp >= BP_MAX_PER_STAT || remaining <= 0}
                  className="w-5 h-5 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center shrink-0 leading-none"
                >+</button>
                {/* Calculated value */}
                <span className={`w-9 text-xs font-mono font-bold text-right shrink-0 ${
                  natureUp ? 'text-red-500' : natureDown ? 'text-blue-500' : 'text-gray-800'
                }`}>
                  {calc}
                </span>
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-2 border-t border-gray-200 pt-2 mt-1">
          <span className="w-12 text-xs font-bold text-gray-600 text-right">合計</span>
          <span className="w-8 text-xs font-mono font-black text-gray-900 text-right">{total}</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-right">
        計算值 = Lv.50・個體值31・{BP_MAX_PER_STAT} BP上限
      </p>
    </div>
  );
}
