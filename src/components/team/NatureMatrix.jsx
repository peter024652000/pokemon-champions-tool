import { useLang } from '../../context/LangContext';
import { NATURES } from '../../utils/constants';

const STATS_5 = ['attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_LABELS = {
  zh: { attack: '攻擊', defense: '防禦', 'special-attack': '特攻', 'special-defense': '特防', speed: '速度' },
  en: { attack: 'Atk',  defense: 'Def',  'special-attack': 'SpA',  'special-defense': 'SpD',  speed: 'Spd'  },
};
// Neutral natures ordered by their diagonal position (attack→defense→spatk→spdef→speed)
const NEUTRAL_EN = ['Hardy', 'Docile', 'Bashful', 'Quirky', 'Serious'];

function getNatureForCell(rowStat, colStat) {
  if (rowStat === colStat) {
    const idx = STATS_5.indexOf(rowStat);
    return NATURES.find(n => n.en === NEUTRAL_EN[idx]);
  }
  return NATURES.find(n => n.increased === rowStat && n.decreased === colStat);
}

export default function NatureMatrix({ currentNature, onSelect, onClose }) {
  const { lang } = useLang();
  const labels = STAT_LABELS[lang === 'zh' ? 'zh' : 'en'];

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          <span className="font-bold text-gray-800">
            {lang === 'zh' ? '選擇個性' : 'Select Nature'}
          </span>
          {currentNature && (
            <span className="ml-auto text-sm text-blue-600 font-semibold">
              {lang === 'zh' ? currentNature.zh : currentNature.en}
            </span>
          )}
        </div>

        <div className="p-4 overflow-x-auto">
          {/* Column headers (decreased stat) */}
          <table className="w-full border-collapse text-center text-xs">
            <thead>
              <tr>
                <th className="w-14 pb-2 text-gray-400 font-normal">
                  <span className="text-[10px]">{lang === 'zh' ? '↑\\↓' : '↑\\↓'}</span>
                </th>
                {STATS_5.map(s => (
                  <th key={s} className="pb-2 font-semibold text-blue-500 text-[11px]">
                    -{labels[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATS_5.map(rowStat => (
                <tr key={rowStat}>
                  {/* Row header (increased stat) */}
                  <td className="py-0.5 pr-1 font-semibold text-red-500 text-[11px] text-right whitespace-nowrap">
                    +{labels[rowStat]}
                  </td>
                  {STATS_5.map(colStat => {
                    const nature = getNatureForCell(rowStat, colStat);
                    if (!nature) return <td key={colStat} />;
                    const isNeutral = rowStat === colStat;
                    const isSelected = currentNature?.en === nature.en;
                    return (
                      <td key={colStat} className="py-0.5 px-0.5">
                        <button
                          onClick={() => { onSelect(nature.en); onClose(); }}
                          className={`w-full px-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all leading-tight ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : isNeutral
                                ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          <div>{lang === 'zh' ? nature.zh : nature.en}</div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[11px] text-gray-400 mt-3 text-center">
            {lang === 'zh'
              ? '行 = 上升能力，列 = 下降能力，灰色 = 無加成'
              : 'Row = increased stat, Column = decreased stat, Gray = neutral'}
          </p>
        </div>
      </div>
    </div>
  );
}
