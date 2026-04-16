import { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import { fetchWithCache } from '../utils/pokeapi';

const BASE = 'https://pokeapi.co/api/v2';

export default function PokemonModal({ entry, onClose }) {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute -top-4 right-0 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-800 z-10 text-xl leading-none"
        >
          ×
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">載入中...</p>
          </div>
        ) : pokemon ? (
          <PokemonCard pokemon={pokemon} species={species} variantLabel={entry.variantLabel} />
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">載入失敗</div>
        )}
      </div>
    </div>
  );
}
