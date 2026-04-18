import { Routes, Route, useLocation } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PokedexPage from './pages/PokedexPage';
import TypeChartPage from './pages/TypeChartPage';
import PokemonDetailPage from './pages/PokemonDetailPage';
import PokemonModal from './components/PokemonModal';

function AppRouter() {
  const location = useLocation();
  // background is set when navigating from the list → show list behind + modal on top
  const background = location.state?.background;

  return (
    <Layout>
      {/* Main routes — render list at background location when overlay is open */}
      <Routes location={background || location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pokedex" element={<PokedexPage />} />
        <Route path="/types" element={<TypeChartPage />} />
        <Route path="/pokemon/:apiName" element={<PokemonDetailPage />} />
      </Routes>

      {/* Overlay modal — only rendered when there's a background (i.e. navigated from list) */}
      {background && (
        <Routes>
          <Route path="/pokemon/:apiName" element={<PokemonModal />} />
        </Routes>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppRouter />
    </LangProvider>
  );
}
