import { useLang } from '../../context/LangContext';
import abilityData from '../../data/ability-data.json';

export default function AbilityPicker({ abilities, currentAbility, onSelect, onClose }) {
  const { lang } = useLang();

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          <span className="font-bold text-gray-800">
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
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {name}
                  </span>
                  {a.is_hidden && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {lang === 'zh' ? '隱藏' : 'Hidden'}
                    </span>
                  )}
                </div>
                {desc && (
                  <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
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
