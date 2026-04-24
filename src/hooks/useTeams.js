import { useState, useEffect } from 'react';

const STORAGE_KEY = 'champions-teams-v1';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useTeams() {
  const [teams, setTeams] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  function createTeam(title = '新隊伍') {
    const id = generateId();
    setTeams(prev => [...prev, { id, title, slots: Array(6).fill(null) }]);
    return id;
  }

  function updateTeam(id, patch) {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  function deleteTeam(id) {
    setTeams(prev => prev.filter(t => t.id !== id));
  }

  function setSlot(teamId, slotIndex, slotData) {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      const slots = [...t.slots];
      slots[slotIndex] = slotData;
      return { ...t, slots };
    }));
  }

  function clearSlot(teamId, slotIndex) {
    setSlot(teamId, slotIndex, null);
  }

  return { teams, createTeam, updateTeam, deleteTeam, setSlot, clearSlot };
}
