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
          bg-white rounded-[16px] border-2 border-dashed border-clay-border
          hover:border-clay-blue/50 hover:bg-clay-blue-light transition-all duration-150 w-full"
      >
        <span className="text-3xl text-clay-border">+</span>
        <span className="text-xs text-clay-silver">
          {lang === 'zh' ? '點擊選擇寶可夢' : 'Select Pokémon'}
        </span>
        <span className="text-xs text-clay-border">#{slotIndex + 1}</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-[16px] border border-clay-border shadow-clay p-3 relative min-h-[200px] flex flex-col hover:shadow-clay-md transition-shadow">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={() => onEdit(slotIndex)}
          title={lang === 'zh' ? '編輯' : 'Edit'}
          className="w-6 h-6 rounded-full bg-clay-oat hover:bg-clay-blue-light text-clay-silver hover:text-clay-blue text-xs flex items-center justify-center transition-colors"
        >✎</button>
        <button
          onClick={() => onClear(slotIndex)}
          title={lang === 'zh' ? '清除' : 'Clear'}
          className="w-6 h-6 rounded-full bg-clay-oat hover:bg-red-100 text-clay-silver hover:text-red-500 text-xs flex items-center justify-center transition-colors"
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
