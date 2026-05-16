import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import SpectatorHeader from "./components/SpectatorHeader/SpectatorHeader";
import HomePage from "./pages/HomePage/HomePage";
import TournamentListPage from "./pages/TournamentListPage/TournamentListPage";
import TournamentDetailPage from "./pages/TournamentDetailPage/TournamentDetailPage";
import RaceSchedulePage from "./pages/RaceSchedulePage/RaceSchedulePage";
import LiveResultsPage from "./pages/LiveResultsPage/LiveResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage/LeaderboardPage";
import SpectatorDashboardPage from "./pages/SpectatorDashboardPage/SpectatorDashboardPage";
import SpectatorTournamentListPage from "./pages/SpectatorTournamentListPage/SpectatorTournamentListPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const isSpectator = location.pathname.startsWith("/spectator");

  return (
    <div className="app-shell">
      {isSpectator ? <SpectatorHeader /> : <Header />}
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentListPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/schedule" element={<RaceSchedulePage />} />
          <Route path="/live-results" element={<LiveResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/spectator" element={<SpectatorDashboardPage />} />
          <Route
            path="/spectator/tournaments"
            element={<SpectatorTournamentListPage />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
