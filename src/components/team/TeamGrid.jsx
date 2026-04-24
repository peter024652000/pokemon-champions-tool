import { useLang } from '../../context/LangContext';
import TeamSlot from './TeamSlot';

export default function TeamGrid({ slots, activeTab, setActiveTab, onPickerOpen, onClear, onEdit }) {
  const { lang } = useLang();

  return (
    <div>
      {/* Tab bar — centered */}
      <div className="flex justify-center gap-1.5 mb-4">
        {[
          { key: 'ability', zh: '能力', en: 'Ability' },
          { key: 'status',  zh: '狀態', en: 'Status'  },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-[16px] text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-clay-blue text-white shadow-clay'
                : 'bg-white text-clay-silver hover:bg-clay-oat border border-clay-border'
            }`}
          >
            {lang === 'zh' ? tab.zh : tab.en}
          </button>
        ))}
      </div>

      {/* 2×3 grid */}
      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot, i) => (
          <TeamSlot
            key={i}
            slot={slot}
            slotIndex={i}
            activeTab={activeTab}
            onPickerOpen={onPickerOpen}
            onClear={onClear}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
