import { useLang } from '../../context/LangContext';
import AbilityView from './AbilityView';
import StatusView from './StatusView';

export default function TeamSlot({ slot, slotIndex, activeTab, onPickerOpen, onClear, onEdit }) {
  const { lang } = useLang();

  if (!slot) {
    return (
      <button
        onClick={() => onPickerOpen(slotIndex)}
        className="min-h-[200px] flex flex-col items-center justify-center gap-2
          bg-white rounded-2xl border-2 border-dashed border-gray-200
          hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 w-full"
      >
        <span className="text-3xl text-gray-200">+</span>
        <span className="text-xs text-gray-400">
          {lang === 'zh' ? '點擊選擇寶可夢' : 'Select Pokémon'}
        </span>
        <span className="text-xs text-gray-300">#{slotIndex + 1}</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 relative min-h-[200px] flex flex-col hover:shadow-md transition-shadow">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={() => onEdit(slotIndex)}
          title={lang === 'zh' ? '編輯' : 'Edit'}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 text-xs flex items-center justify-center transition-colors"
        >✎</button>
        <button
          onClick={() => onClear(slotIndex)}
          title={lang === 'zh' ? '清除' : 'Clear'}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 text-xs flex items-center justify-center transition-colors"
        >×</button>
      </div>

      <div className="flex-1 pr-10">
        {activeTab === 'ability'
          ? <AbilityView slot={slot} />
          : <StatusView slot={slot} />
        }
      </div>
    </div>
  );
}
