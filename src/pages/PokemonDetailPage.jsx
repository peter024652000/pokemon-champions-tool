import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PokemonCard from '../components/PokemonCard';
import { fetchWithCache } from '../utils/pokeapi';
import { INITIAL_ENTRIES } from '../hooks/usePokemonList';

const BASE = 'https://pokeapi.co/api/v2';

export default function PokemonDetailPage() {
  const { apiName } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // entry comes from navigation state (fast) or falls back to static list lookup
  const entry = state?.entry ?? INITIAL_ENTRIES.find(e => e.apiName === apiName);

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

  if (!entry) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p className="text-2xl mb-2">😵</p>
          <p>找不到這隻寶可夢</p>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-500 text-sm underline">
            回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Back button header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          ← 回列表
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
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
  );
}
