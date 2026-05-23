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
import OwnerHeader from "./components/OwnerHeader/OwnerHeader";
import HomePage from "./pages/HomePage/HomePage";
import TournamentListPage from "./pages/TournamentListPage/TournamentListPage";
import TournamentDetailPage from "./pages/TournamentDetailPage/TournamentDetailPage";
import RaceSchedulePage from "./pages/RaceSchedulePage/RaceSchedulePage";
import LiveResultsPage from "./pages/LiveResultsPage/LiveResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage/LeaderboardPage";
import SpectatorDashboardPage from "./pages/SpectatorDashboardPage/SpectatorDashboardPage";
import SpectatorTournamentListPage from "./pages/SpectatorTournamentListPage/SpectatorTournamentListPage";
import SpectatorRaceSchedulePage from "./pages/SpectatorRaceSchedulePage/SpectatorRaceSchedulePage";
import SpectatorLiveRankingPage from "./pages/SpectatorLiveRankingPage/SpectatorLiveRankingPage";
import SpectatorPredictionFormPage from "./pages/SpectatorPredictionFormPage/SpectatorPredictionFormPage";
import SpectatorPredictionResultPage from "./pages/SpectatorPredictionResultPage/SpectatorPredictionResultPage";
import SpectatorRewardNotificationsPage from "./pages/SpectatorRewardNotificationsPage/SpectatorRewardNotificationsPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage/OwnerDashboardPage";
import OwnerHorseListPage from "./pages/OwnerHorseListPage/OwnerHorseListPage";
import OwnerHorseDetailPage from "./pages/OwnerHorseDetailPage/OwnerHorseDetailPage";
import OwnerHorseCreatePage from "./pages/OwnerHorseCreatePage/OwnerHorseCreatePage";
import OwnerHorseEditPage from "./pages/OwnerHorseEditPage/OwnerHorseEditPage";
import OwnerTournamentListPage from "./pages/OwnerTournamentListPage/OwnerTournamentListPage";
import OwnerTournamentRegisterPage from "./pages/OwnerTournamentRegisterPage/OwnerTournamentRegisterPage";
import OwnerRaceConfirmationPage from "./pages/OwnerRaceConfirmationPage/OwnerRaceConfirmationPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const isSpectator = location.pathname.startsWith("/spectator");
  const isOwner = location.pathname.startsWith("/owner");

  return (
    <div className="app-shell">
      {isSpectator ? (
        <SpectatorHeader />
      ) : isOwner ? (
        <OwnerHeader />
      ) : (
        <Header />
      )}
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
          <Route
            path="/spectator/schedule"
            element={<SpectatorRaceSchedulePage />}
          />
          <Route
            path="/spectator/rankings"
            element={<SpectatorLiveRankingPage />}
          />
          <Route
            path="/spectator/predictions/new"
            element={<SpectatorPredictionFormPage />}
          />
          <Route
            path="/spectator/predictions/history"
            element={<SpectatorPredictionResultPage />}
          />
          <Route
            path="/spectator/rewards"
            element={<SpectatorRewardNotificationsPage />}
          />
          <Route path="/owner" element={<OwnerDashboardPage />} />
          <Route path="/owner/horses" element={<OwnerHorseListPage />} />
          <Route path="/owner/horses/new" element={<OwnerHorseCreatePage />} />
          <Route path="/owner/horses/:id" element={<OwnerHorseDetailPage />} />
          <Route
            path="/owner/horses/:id/edit"
            element={<OwnerHorseEditPage />}
          />
          <Route
            path="/owner/tournaments"
            element={<OwnerTournamentListPage />}
          />
          <Route
            path="/owner/HorseRegister"
            element={<OwnerTournamentRegisterPage />}
          />
          <Route
            path="/owner/race-confirmations"
            element={<OwnerRaceConfirmationPage />}
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
