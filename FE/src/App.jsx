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
import JockeyHeader from "./components/JockeyHeader/JockeyHeader";
import OwnerHeader from "./components/OwnerHeader/OwnerHeader";
import AdminHeader from "./components/AdminHeader/AdminHeader";
import HomePage from "./pages/HomePage/HomePage";
import TournamentListPage from "./pages/TournamentListPage/TournamentListPage";
import TournamentDetailPage from "./pages/TournamentDetailPage/TournamentDetailPage";
import RaceSchedulePage from "./pages/RaceSchedulePage/RaceSchedulePage";
import LiveResultsPage from "./pages/LiveResultsPage/LiveResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage/LeaderboardPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import SpectatorDashboardPage from "./pages/SpectatorDashboardPage/SpectatorDashboardPage";
import SpectatorTournamentListPage from "./pages/SpectatorTournamentListPage/SpectatorTournamentListPage";
import SpectatorRaceSchedulePage from "./pages/SpectatorRaceSchedulePage/SpectatorRaceSchedulePage";
import SpectatorLiveRankingPage from "./pages/SpectatorLiveRankingPage/SpectatorLiveRankingPage";
import SpectatorPredictionFormPage from "./pages/SpectatorPredictionFormPage/SpectatorPredictionFormPage";
import SpectatorPredictionResultPage from "./pages/SpectatorPredictionResultPage/SpectatorPredictionResultPage";
import SpectatorRewardNotificationsPage from "./pages/SpectatorRewardNotificationsPage/SpectatorRewardNotificationsPage";
import { JockeyInvitationPage } from "./pages/JockeyInvitationPage/JockeyInvitationPage";
import JockeyInvitationDetailPage from "./pages/JockeyInvitationPage/JockeyInvitationDetailPage";
import JockeyDashboardPage from "./pages/JockeyDashboardPage/JockeyDashboardPage";
import { JockeySchedulePage } from "./pages/JockeySchedulePage/JockeySchedulePage";
import { JockeyPerformancePage } from "./pages/JockeyPerformancePage/JockeyPerformancePage";
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
import AdminPage from "./pages/AdminPage/AdminPage";
import "./App.css";

const getStoredAuthUser = () => {
  const user = localStorage.getItem("authUser");
  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

function AppLayout() {
  const location = useLocation();
  const authUser = getStoredAuthUser();
  const hasAuthToken = Boolean(localStorage.getItem("authToken"));
  const adminPage =
    hasAuthToken && authUser?.role === "admin" ? (
      <AdminPage />
    ) : (
      <Navigate to="/login" replace />
    );

  const isSpectator = location.pathname.startsWith("/spectator");
  const isJockey = location.pathname.startsWith("/jockey");
  const isOwner = location.pathname.startsWith("/owner");
  const isAdmin = location.pathname.startsWith("/admin");

  const renderHeader = () => {
    if (isSpectator || authUser?.role === "spectator") {
      return <SpectatorHeader />;
    }

    if (isJockey || authUser?.role === "jockey") {
      return <JockeyHeader />;
    }

    if (isOwner || authUser?.role === "owner") {
      return <OwnerHeader />;
    }

    if (isAdmin || authUser?.role === "admin") {
      return <AdminHeader />;
    }

    return <Header />;
  };

  return (
    <div className="app-shell">
      {renderHeader()}
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentListPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/schedule" element={<RaceSchedulePage />} />
          <Route path="/live-results" element={<LiveResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
            path="/spectator/live-ranking"
            element={<SpectatorLiveRankingPage />}
          />
          <Route
            path="/spectator/predictions"
            element={<SpectatorPredictionFormPage />}
          />
          <Route
            path="/spectator/predictions/results"
            element={<SpectatorPredictionResultPage />}
          />
          <Route
            path="/spectator/rewards"
            element={<SpectatorRewardNotificationsPage />}
          />
          <Route path="/jockey" element={<JockeyDashboardPage />} />
          <Route path="/jockey/invitations" element={<JockeyInvitationPage />} />
          <Route
            path="/jockey/invitations/:id"
            element={<JockeyInvitationDetailPage />}
          />
          <Route path="/jockey/schedule" element={<JockeySchedulePage />} />
          <Route
            path="/jockey/performance"
            element={<JockeyPerformancePage />}
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
            path="/owner/register-tournament"
            element={<OwnerTournamentRegisterPage />}
          />
          <Route
            path="/owner/race-confirmations"
            element={<OwnerRaceConfirmationPage />}
          />
          <Route path="/admin" element={adminPage} />
          <Route path="/admin/users" element={adminPage} />
          <Route path="/admin/users/:id" element={adminPage} />
          <Route path="/admin/users/:userId/horses/:horseId" element={adminPage} />
          <Route path="/admin/roles" element={adminPage} />
          <Route path="/admin/tournaments" element={adminPage} />
          <Route path="/admin/rounds" element={adminPage} />
          <Route path="/admin/races" element={adminPage} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
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
