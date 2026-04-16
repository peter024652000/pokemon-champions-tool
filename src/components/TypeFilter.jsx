import { ALL_TYPES, TYPE_COLORS, TYPE_NAMES_ZH } from '../utils/constants';

export default function TypeFilter({ selected, onChange }) {
  const toggle = (type) =>
    onChange(selected.includes(type)
      ? selected.filter(t => t !== type)
      : [...selected, type]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500">屬性篩選</span>
        {selected.length > 0 && (
          <>
            <span className="text-xs text-gray-400">（需同時符合所選屬性）</span>
            <button
              onClick={() => onChange([])}
              className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              清除
            </button>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_TYPES.map(type => {
          const active = selected.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggle(type)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border
                ${active
                  ? 'text-white border-transparent shadow scale-105'
                  : 'text-gray-500 bg-white border-gray-200 hover:border-gray-400'
                }`}
              style={active ? { backgroundColor: TYPE_COLORS[type] } : {}}
            >
              {TYPE_NAMES_ZH[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
