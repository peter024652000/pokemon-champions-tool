import { useState, useCallback } from 'react';

const STORAGE_KEY = 'champions-builds-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function persist(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useBuilds(apiName) {
  const [all, setAll] = useState(load);
  const builds = all[apiName] || [];

  const saveBuild = useCallback((name, draft) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const entry = {
      id, name,
      savedAt: Date.now(),
      selectedAbility: draft.selectedAbility,
      nature: draft.nature,
      bp: { ...draft.bp },
      selectedMoves: [...draft.selectedMoves],
      heldItem: draft.heldItem,
    };
    setAll(prev => {
      const next = { ...prev, [apiName]: [...(prev[apiName] || []), entry] };
      persist(next);
      return next;
    });
  }, [apiName]);

  const updateBuild = useCallback((id, draft) => {
    setAll(prev => {
      const next = {
        ...prev,
        [apiName]: (prev[apiName] || []).map(b =>
          b.id === id ? {
            ...b,
            selectedAbility: draft.selectedAbility,
            nature: draft.nature,
            bp: { ...draft.bp },
            selectedMoves: [...draft.selectedMoves],
            heldItem: draft.heldItem,
          } : b
        ),
      };
      persist(next);
      return next;
    });
  }, [apiName]);

  const renameBuild = useCallback((id, newName) => {
    setAll(prev => {
      const next = {
        ...prev,
        [apiName]: (prev[apiName] || []).map(b =>
          b.id === id ? { ...b, name: newName } : b
        ),
      };
      persist(next);
      return next;
    });
  }, [apiName]);

  const deleteBuild = useCallback((id) => {
    setAll(prev => {
      const next = { ...prev, [apiName]: (prev[apiName] || []).filter(b => b.id !== id) };
      persist(next);
      return next;
    });
  }, [apiName]);

  return { builds, saveBuild, updateBuild, renameBuild, deleteBuild };
}
