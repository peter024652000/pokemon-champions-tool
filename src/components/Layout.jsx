import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const NAV_ITEMS = [
  { path: '/pokedex', zh: '圖鑑', en: 'Pokédex' },
  { path: '/types',   zh: '屬性相剋', en: 'Type Chart' },
];

export default function Layout({ children }) {
  const { lang, setLang } = useLang();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="text-lg font-black text-gray-800 shrink-0 hover:text-blue-600 transition-colors">
            Champions Tool
          </Link>

          {/* Nav links */}
          <div className="flex gap-1">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
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

          {/* Language toggle — pushed right */}
          <div className="ml-auto flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
            <button
              onClick={() => setLang('zh')}
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                lang === 'zh' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-sm font-semibold transition-colors border-l border-gray-200 ${
                lang === 'en' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
