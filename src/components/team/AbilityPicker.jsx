import { useLang } from '../../context/LangContext';
import abilityData from '../../data/ability-data.json';

export default function AbilityPicker({ abilities, currentAbility, onSelect, onClose }) {
  const { lang } = useLang();

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-[16px] shadow-clay-md w-full max-w-sm">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-clay-border">
          <button onClick={onClose} className="text-clay-silver hover:text-clay-charcoal text-lg leading-none">✕</button>
          <span className="font-bold text-clay-charcoal">
            {lang === 'zh' ? '選擇特性' : 'Select Ability'}
          </span>
        </div>

        <div className="p-3 space-y-2">
          {(abilities || []).map(a => {
            const slug = a.ability.name;
            const entry = abilityData[slug];
            const name = lang === 'zh' ? (entry?.zh || slug) : (entry?.en || slug);
            const desc = lang === 'zh'
              ? (entry?.zhDesc || entry?.enDesc || '')
              : (entry?.enDesc || '');
            const isSelected = currentAbility === slug;
            return (
              <button
                key={slug}
                onClick={() => { onSelect(slug); onClose(); }}
                className={`w-full text-left px-4 py-3 rounded-[16px] border transition-all ${
                  isSelected
                    ? 'bg-clay-blue border-clay-blue text-white'
                    : 'bg-white border-clay-border hover:border-clay-blue/40 hover:bg-clay-blue-light'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-clay-charcoal'}`}>
                    {name}
                  </span>
                </div>
                {desc && (
                  <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-white/80' : 'text-clay-silver'}`}>
                    {desc}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
