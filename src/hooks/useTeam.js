import { useState, useEffect } from 'react';

const STORAGE_KEY = 'champions-team-v1';
const EMPTY = Array(6).fill(null);

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 6) return EMPTY;
    return parsed.map(s => (s && s.apiName) ? s : null);
  } catch {
    return EMPTY;
  }
}

export function useTeam() {
  const [slots, setSlots] = useState(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [slots]);

  function setSlot(index, slotData) {
    setSlots(prev => prev.map((s, i) => i === index ? slotData : s));
  }

  function clearSlot(index) {
    setSlots(prev => prev.map((s, i) => i === index ? null : s));
  }

  return { slots, setSlot, clearSlot };
}
