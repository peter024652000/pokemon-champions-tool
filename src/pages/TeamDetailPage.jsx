import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePokemonData } from '../context/PokemonContext';
import { useLang } from '../context/LangContext';
import { useTeams } from '../hooks/useTeams';
import TeamGrid from '../components/team/TeamGrid';
import PokemonPicker from '../components/team/PokemonPicker';
import ConfigPanel from '../components/team/ConfigPanel';

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { list } = usePokemonData();
  const { teams, updateTeam, setSlot, clearSlot } = useTeams();
  const { lang } = useLang();
  const navigate = useNavigate();

  const team = teams.find(t => t.id === teamId);

  const [activeTab, setActiveTab] = useState('ability');
  const [pickerSlot, setPickerSlot] = useState(null);
  const [configState, setConfigState] = useState(null);

  // Merge stored slots with live stats/abilities from PokemonContext
  const hydratedSlots = useMemo(() => {
    if (!team) return Array(6).fill(null);
    return team.slots.map(slot => {
      if (!slot) return null;
      const live = list.find(p => p.apiName === slot.apiName);
      if (!live || !live.loaded) return slot;
      return {
        ...slot,
        stats: live.stats,
        abilities: live.abilities,
        sprite: live.sprite || slot.sprite,
        spriteFallback: live.spriteFallback || slot.spriteFallback,
      };
    });
  }, [team, list]);

  if (!team) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-lg mb-4">{lang === 'zh' ? '找不到此隊伍' : 'Team not found'}</p>
        <button onClick={() => navigate('/team')} className="text-blue-500 hover:underline text-sm">
          {lang === 'zh' ? '← 返回隊伍清單' : '← Back to teams'}
        </button>
      </div>
    );
  }

  function handlePickerOpen(index) {
    setPickerSlot(index);
  }

  function handlePickerSelect(pokemon) {
    const index = pickerSlot;
    setPickerSlot(null);
    const existingSlot = team.slots[index];
    const initDraft = (existingSlot && existingSlot.apiName === pokemon.apiName) ? {
      selectedAbility: existingSlot.selectedAbility,
      nature: existingSlot.nature,
      bp: { ...existingSlot.bp },
      selectedMoves: [...existingSlot.selectedMoves],
      heldItem: existingSlot.heldItem,
    } : null;
    setConfigState({ index, pokemon, initDraft });
  }

  function handleEdit(index) {
    const slot = hydratedSlots[index];
    if (!slot) return;
    setConfigState({
      index,
      pokemon: slot,
      initDraft: {
        selectedAbility: slot.selectedAbility,
        nature: slot.nature,
        bp: { ...slot.bp },
        selectedMoves: [...slot.selectedMoves],
        heldItem: slot.heldItem,
      },
    });
  }

  function handleConfigConfirm(draft) {
    const { index, pokemon } = configState;
    setSlot(teamId, index, {
      apiName: pokemon.apiName,
      id: pokemon.id,
      zhName: pokemon.zhName,
      enName: pokemon.enName,
      types: pokemon.types,
      sprite: pokemon.sprite,
      spriteFallback: pokemon.spriteFallback,
      isMega: pokemon.isMega,
      variantLabel: pokemon.variantLabel,
      enLabel: pokemon.enLabel,
      ...draft,
    });
    setConfigState(null);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 xl:px-10 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/team')}
        className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 transition-colors"
      >
        ← {lang === 'zh' ? '所有隊伍' : 'All Teams'}
      </button>

      {/* Editable title + centered tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <input
          type="text"
          value={team.title}
          onChange={e => updateTeam(teamId, { title: e.target.value })}
          placeholder={lang === 'zh' ? '隊伍名稱...' : 'Team name...'}
          className="text-2xl font-black text-gray-800 bg-transparent border-b-2 border-transparent
            hover:border-gray-200 focus:border-blue-400 focus:outline-none transition-colors
            placeholder-gray-300 min-w-0"
        />
      </div>

      <TeamGrid
        slots={hydratedSlots}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPickerOpen={handlePickerOpen}
        onClear={index => clearSlot(teamId, index)}
        onEdit={handleEdit}
      />

      {pickerSlot !== null && (
        <PokemonPicker
          onSelect={handlePickerSelect}
          onClose={() => setPickerSlot(null)}
        />
      )}

      {configState && (
        <ConfigPanel
          pokemon={configState.pokemon}
          initDraft={configState.initDraft}
          onConfirm={handleConfigConfirm}
          onCancel={() => setConfigState(null)}
        />
      )}
    </div>
  );
}
