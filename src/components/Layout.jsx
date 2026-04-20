import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const NAV_ITEMS = [
  { path: '/pokedex', zh: '圖鑑',     en: 'Pokédex'    },
  { path: '/types',   zh: '屬性相剋', en: 'Type Chart' },
  { path: '/speed',   zh: '速度排行', en: 'Speed'      },
];

const LANGS = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'EN'   },
];

function LangDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.value === lang);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {current?.label}
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Menu */}
          <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[80px]">
            {LANGS.map(l => (
              <button
                key={l.value}
                onClick={() => { setLang(l.value); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-sm text-left font-semibold transition-colors hover:bg-gray-50
                  ${lang === l.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { lang, setLang } = useLang();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 h-14 flex items-center gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="text-base sm:text-lg font-black text-gray-800 shrink-0 hover:text-blue-600 transition-colors whitespace-nowrap">
            Champions<span className="hidden sm:inline"> Tool</span>
          </Link>

          {/* Nav links */}
          <div className="flex gap-0.5 sm:gap-1">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {lang === 'zh' ? item.zh : item.en}
                </Link>
              );
            })}
          </div>

          {/* Language dropdown — pushed right */}
          <div className="ml-auto">
            <LangDropdown lang={lang} setLang={setLang} />
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
