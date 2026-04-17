import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import { fetchWithCache } from '../utils/pokeapi';

const BASE = 'https://pokeapi.co/api/v2';

export default function PokemonModal() {
  const { state } = useLocation();
  const entry = state?.entry;
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  function onClose() { navigate(-1); }

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

  // Trigger fade-in after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!entry) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Centred overlay panel with padding */}
      {/* Close button — fixed to viewport top-right, above everything */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-800 text-2xl leading-none pointer-events-auto"
      >
        ×
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

        <div
          className={`pointer-events-auto w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-200 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">載入中...</p>
            </div>
          ) : pokemon ? (
            <PokemonCard
              pokemon={pokemon}
              species={species}
              variantLabel={entry.variantLabel}
              isMegaVariant={entry.isMega}
              speciesId={entry.id}
            />
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">載入失敗</div>
          )}
        </div>
      </div>
    </>
  );
}
