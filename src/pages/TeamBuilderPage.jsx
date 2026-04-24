import { useState, useMemo } from 'react';
import { usePokemonData } from '../context/PokemonContext';
import { useLang } from '../context/LangContext';
import { useTeam } from '../hooks/useTeam';
import TeamGrid from '../components/team/TeamGrid';
import PokemonPicker from '../components/team/PokemonPicker';
import ConfigPanel from '../components/team/ConfigPanel';

export default function TeamBuilderPage() {
  const { list } = usePokemonData();
  const { slots, setSlot, clearSlot } = useTeam();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState('ability');
  const [pickerSlot, setPickerSlot] = useState(null);
  const [configState, setConfigState] = useState(null); // { index, pokemon, initDraft }

  // Merge stored compact slots with live stats/abilities from context
  const hydratedSlots = useMemo(() => {
    return slots.map(slot => {
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
  }, [slots, list]);

  function handlePickerOpen(index) {
    setPickerSlot(index);
  }

  function handlePickerSelect(pokemon) {
    const index = pickerSlot;
    setPickerSlot(null);
    const existingSlot = slots[index];
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
    setSlot(index, {
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
      <h1 className="text-2xl font-black text-clay-charcoal mb-6">
        {lang === 'zh' ? '組隊' : 'Team Builder'}
      </h1>

      <TeamGrid
        slots={hydratedSlots}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPickerOpen={handlePickerOpen}
        onClear={clearSlot}
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
