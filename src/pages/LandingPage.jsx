import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const FEATURES = [
  {
    icon: '📖',
    zh: '寶可夢圖鑑',
    en: 'Pokédex',
    descZh: '瀏覽所有 Champions 可用的寶可夢，查看種族值、特性、招式與屬性相剋。支援名稱搜尋與屬性篩選。',
    descEn: 'Browse all Pokémon available in Champions. View base stats, abilities, moves and type matchups. Search by name or filter by type.',
    to: '/pokedex',
    btnZh: '前往圖鑑',
    btnEn: 'Open Pokédex',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: '⚡',
    zh: '屬性相剋表',
    en: 'Type Chart',
    descZh: '選擇任一屬性，即時查看攻擊強弱與防守相剋關係。快速掌握各屬性的克制與弱點。',
    descEn: 'Select any type to instantly see offensive and defensive matchups. Quickly understand type advantages and weaknesses.',
    to: '/types',
    btnZh: '查看屬性',
    btnEn: 'View Types',
    color: 'from-orange-500 to-red-500',
  },
];

export default function LandingPage() {
  const { lang } = useLang();
  const zh = lang === 'zh';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-clay-cream flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
          {zh ? '非官方工具' : 'Unofficial fan tool'}
        </p>
        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
          {zh ? 'Champions 查詢工具' : 'Champions Tool'}
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
          {zh
            ? '針對 Pokémon Champions 設計的雙語查詢工具。輕鬆查看寶可夢資料、種族值分配與屬性相剋，幫助你組出更強的隊伍。'
            : 'A bilingual reference tool built for Pokémon Champions. Look up Pokémon data, EV spreads, and type matchups to build stronger teams.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pokedex"
            className="px-6 py-3 bg-clay-blue hover:opacity-90 rounded-full font-bold text-base transition-opacity shadow-lg"
          >
            {zh ? '前往圖鑑 →' : 'Open Pokédex →'}
          </Link>
          <Link
            to="/types"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold text-base transition-colors border border-white/20"
          >
            {zh ? '屬性相剋 →' : 'Type Chart →'}
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-screen-md mx-auto w-full px-4 py-12 grid sm:grid-cols-2 gap-5">
        {FEATURES.map(f => (
          <Link
            key={f.to}
            to={f.to}
            className="group bg-white rounded-[16px] shadow-clay hover:shadow-clay-md transition-shadow overflow-hidden border border-clay-border"
          >
            <div className={`h-2 bg-gradient-to-r ${f.color}`} />
            <div className="p-6">
              <p className="text-3xl mb-3">{f.icon}</p>
              <h2 className="text-lg font-black text-clay-charcoal mb-1">
                {zh ? f.zh : f.en}
              </h2>
              <p className="text-sm text-clay-silver leading-relaxed mb-4">
                {zh ? f.descZh : f.descEn}
              </p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r ${f.color} group-hover:opacity-90 transition-opacity`}>
                {zh ? f.btnZh : f.btnEn}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-auto py-6 text-center text-xs text-clay-silver px-4 space-y-1">
        <div>
          {zh
            ? '遊戲內容版權屬任天堂／寶可夢公司所有。本工具與官方無關。'
            : 'Game content © Nintendo / The Pokémon Company. This tool is unofficial and unaffiliated.'}
        </div>
        <div>
          {zh
            ? <>招式與道具資料來自 <a href="https://github.com/projectpokemon/champout" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay-charcoal">projectpokemon/champout</a>（MIT）；寶可夢基礎資料來自 <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay-charcoal">PokéAPI</a>。部分數值可能與遊戲內不同。</>
            : <>Move & item data from <a href="https://github.com/projectpokemon/champout" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay-charcoal">projectpokemon/champout</a> (MIT); Pokémon data from <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay-charcoal">PokéAPI</a>. Some values may differ from in-game data.</>}
        </div>
      </div>
    </div>
  );
}
