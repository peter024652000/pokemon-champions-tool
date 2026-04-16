import { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import { fetchWithCache } from '../utils/pokeapi';

const BASE = 'https://pokeapi.co/api/v2';

export default function PokemonModal({ entry, onClose }) {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setLoading(true);
    setPokemon(null);
    setSpecies(null);

    Promise.all([
      fetchWithCache(`${BASE}/pokemon/${entry.apiName}`),
      fetchWithCache(`${BASE}/pokemon-species/${entry.id}`),
    ]).then(([p, s]) => {
      setPokemon(p);
      setSpecies(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [entry?.apiName]);

  // Trigger slide-in animation after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-slate-100 z-50 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Sticky close button */}
        <div className="sticky top-0 z-10 flex justify-end p-3 bg-slate-100/80 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-800 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-4 pb-8 -mt-2">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">載入中...</p>
            </div>
          ) : pokemon ? (
            <PokemonCard pokemon={pokemon} species={species} variantLabel={entry.variantLabel} isMegaVariant={entry.isMega} speciesId={entry.id} />
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">載入失敗</div>
          )}
        </div>
      </div>
    </>
  );
}
