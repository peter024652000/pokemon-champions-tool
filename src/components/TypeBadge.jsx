import { TYPE_COLORS, TYPE_NAMES_ZH, TYPE_ICON_BASE } from '../utils/constants';
import { useLang } from '../context/LangContext';

const SIZE = {
  xs: { pill: 'px-1.5 py-0.5 text-[11px] gap-1',   icon: 'h-3 w-3'    },
  sm: { pill: 'px-2   py-1   text-xs      gap-1',   icon: 'h-3.5 w-3.5' },
  md: { pill: 'px-3   py-1.5 text-sm      gap-1.5', icon: 'h-4 w-4'    },
  lg: { pill: 'px-4   py-2   text-base    gap-2',   icon: 'h-5 w-5'    },
};

export default function TypeBadge({ type, size = 'md' }) {
  const { lang } = useLang();
  const color = TYPE_COLORS[type] || '#888';
  const name = lang === 'zh'
    ? (TYPE_NAMES_ZH[type] || type)
    : type.charAt(0).toUpperCase() + type.slice(1);

  const { pill, icon } = SIZE[size] ?? SIZE.md;
  const iconUrl = `${TYPE_ICON_BASE}${type}.png`;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white leading-tight ${pill}`}
      style={{ backgroundColor: color }}
    >
      <img src={iconUrl} alt="" className={`shrink-0 ${icon}`} />
      {name}
    </span>
  );
}
