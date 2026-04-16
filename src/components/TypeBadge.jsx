import { TYPE_COLORS, TYPE_NAMES_ZH } from '../utils/constants';

export default function TypeBadge({ type, size = 'md' }) {
  const color = TYPE_COLORS[type] || '#888';
  const name = TYPE_NAMES_ZH[type] || type;

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
