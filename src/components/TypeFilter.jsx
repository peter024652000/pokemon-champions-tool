import { ALL_TYPES, TYPE_COLORS, TYPE_NAMES_ZH, TYPE_ICON_BASE, MEGA_SIGIL_URL } from '../utils/constants';
import { useLang } from '../context/LangContext';

export default function TypeFilter({
  selected,
  onChange,
  maxSelect = 2,
  showMega,
  onMegaChange,
}) {
  const { lang } = useLang();
  const zh = lang === 'zh';

  const toggle = (type) => {
    if (selected.includes(type)) {
      onChange(selected.filter(t => t !== type));
    } else if (selected.length < maxSelect) {
      onChange([...selected, type]);
    }
  };

  const atMax = selected.length >= maxSelect;

  const typeName = (type) =>
    zh ? TYPE_NAMES_ZH[type] : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div>
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500">
          {zh ? '屬性篩選' : 'Type Filter'}
        </span>
        {atMax && (
          <span className="text-xs text-gray-400">
            {zh ? `（最多選 ${maxSelect} 個）` : `(max ${maxSelect})`}
          </span>
        )}
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="ml-1 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            {zh ? '清除' : 'Clear'}
          </button>
        )}
      </div>

      {/* 2×9 grid + Mega toggle vertically centered on the right */}
      <div className="flex items-center gap-3">
        {/* Type grid */}
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-x-2 gap-y-2 sm:gap-x-3 flex-1">
          {ALL_TYPES.map(type => {
            const active = selected.includes(type);
            const disabled = !active && atMax;

            return (
              <button
                key={type}
                onClick={() => toggle(type)}
                disabled={disabled}
                className={`w-full inline-flex items-center justify-center p-1.5 sm:gap-1 sm:px-2 sm:py-1.5 rounded-full text-xs font-bold transition-all
                  ${disabled
                    ? 'opacity-25 cursor-not-allowed text-white'
                    : active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                  }`}
                style={{
                  backgroundColor: TYPE_COLORS[type],
                  boxShadow: active
                    ? `0 0 0 3px white, 0 0 0 5px ${TYPE_COLORS[type]}`
                    : undefined,
                }}
              >
                <img src={`${TYPE_ICON_BASE}${type}.png`} alt="" className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{typeName(type)}</span>
              </button>
            );
          })}
        </div>

        {/* Mega toggle — right side, centered between the two rows */}
        {onMegaChange !== undefined && (
          <button
            onClick={() => onMegaChange(!showMega)}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all border
              ${showMega
                ? 'bg-violet-500 border-transparent shadow ring-2 ring-white ring-offset-1 ring-offset-transparent'
                : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-violet-50'
              }`}
            title="Mega"
          >
            <img src={MEGA_SIGIL_URL} alt="Mega" className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
