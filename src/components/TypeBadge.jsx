import { TYPE_COLORS, TYPE_NAMES_ZH } from '../utils/constants';
import { useLang } from '../context/LangContext';

export default function TypeBadge({ type, size = 'md' }) {
  const { lang } = useLang();
  const color = TYPE_COLORS[type] || '#888';
  const name = lang === 'zh'
    ? (TYPE_NAMES_ZH[type] || type)
    : type.charAt(0).toUpperCase() + type.slice(1);

  const sizeClass = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }[size];

  return (
    <span
      className={`inline-block rounded-full font-semibold text-white leading-tight ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}
