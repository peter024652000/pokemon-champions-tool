import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { PokemonProvider } from './context/PokemonContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PokedexPage from './pages/PokedexPage';
import TypeChartPage from './pages/TypeChartPage';
import SpeedPage from './pages/SpeedPage';
import PokemonDetailPage from './pages/PokemonDetailPage';
import TeamBuilderPage from './pages/TeamBuilderPage';

function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pokedex" element={<PokedexPage />} />
        <Route path="/types" element={<TypeChartPage />} />
        <Route path="/speed" element={<SpeedPage />} />
        <Route path="/pokemon/:apiName" element={<PokemonDetailPage />} />
        <Route path="/team" element={<TeamBuilderPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <LangProvider>
      <PokemonProvider>
        <AppRouter />
      </PokemonProvider>
    </LangProvider>
  );
}
