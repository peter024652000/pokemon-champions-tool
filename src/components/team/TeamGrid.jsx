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
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
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
