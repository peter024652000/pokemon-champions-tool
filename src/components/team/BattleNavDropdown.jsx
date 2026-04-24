import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

const BATTLE_ITEMS = [
  { path: '/team', zh: '組隊',     en: 'Team Builder',  active: true  },
  { path: null,    zh: '對戰模擬', en: 'Battle Sim',    active: false },
  { path: null,    zh: '傷害計算', en: 'Damage Calc',   active: false },
  { path: null,    zh: '速度比較', en: 'Speed Compare', active: false },
];

export default function BattleNavDropdown() {
  const [open, setOpen] = useState(false);
  const { lang } = useLang();
  const location = useLocation();
  const isBattleActive = location.pathname.startsWith('/team');

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
          isBattleActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
      >
        {lang === 'zh' ? '對戰' : 'Battle'}
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
            {BATTLE_ITEMS.map((item, i) => {
              const label = lang === 'zh' ? item.zh : item.en;
              if (!item.active) {
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 opacity-40 cursor-not-allowed">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-[10px] text-gray-400 ml-2">soon</span>
                  </div>
                );
              }
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${
                    isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
