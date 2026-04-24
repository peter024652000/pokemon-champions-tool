import { createContext, useContext } from 'react';
import { usePokemonList } from '../hooks/usePokemonList';

const PokemonContext = createContext(null);

export function PokemonProvider({ children }) {
  const data = usePokemonList();
  return <PokemonContext.Provider value={data}>{children}</PokemonContext.Provider>;
}

export function usePokemonData() {
  return useContext(PokemonContext);
}
