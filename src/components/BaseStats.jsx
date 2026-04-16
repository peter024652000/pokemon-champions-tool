import { STAT_NAMES_ZH, STAT_COLORS } from '../utils/constants';

export default function BaseStats({ stats }) {
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <div>
      <h3 className="text-base font-bold mb-3 text-gray-700">種族值</h3>
      <div className="space-y-2">
        {stats.map(({ stat, base_stat }) => {
          const name = stat.name;
          const color = STAT_COLORS[name] || '#888';
          const pct = Math.min((base_stat / 255) * 100, 100);

          return (
            <div key={name} className="flex items-center gap-2">
              <span className="w-12 text-xs text-gray-500 text-right shrink-0">
                {STAT_NAMES_ZH[name] || name}
              </span>
              <span className="w-8 text-xs font-mono font-bold text-gray-800 text-right shrink-0">
                {base_stat}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-2 border-t border-gray-200 pt-2 mt-1">
          <span className="w-12 text-xs font-bold text-gray-600 text-right">合計</span>
          <span className="w-8 text-xs font-mono font-black text-gray-900 text-right">{total}</span>
        </div>
      </div>
    </div>
  );
}
