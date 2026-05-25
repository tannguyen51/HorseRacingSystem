import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import SpectatorHeader from "./components/SpectatorHeader/SpectatorHeader";
import JockeyHeader from "./components/JockeyHeader/JockeyHeader";


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



import { JockeyInvitationPage } from "./pages/JockeyInvitationPage/JockeyInvitationPage";
import { JockeySchedulePage } from "./pages/JockeySchedulePage/JockeySchedulePage";
import { JockeyPerformancePage } from "./pages/JockeyPerformancePage/JockeyPerformancePage";

// Auth Pages
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("authUser");

    if (!user) {
      setAuthUser(null);
      return;
    }

    try {
      setAuthUser(JSON.parse(user));
    } catch {
      setAuthUser(null);
    }
  }, [location.pathname]);

  const isSpectator = location.pathname.startsWith("/spectator");
  const isJockey = location.pathname.startsWith("/jockey");

 
  const renderHeader = () => {
    if (isSpectator || (authUser?.role === "spectator")) return <SpectatorHeader />;
    if (isJockey || authUser?.role === "jockey") return <JockeyHeader />;
   
    return <Header isLoggedIn={!!authUser} />;
  };

  return (
    <div className="app-shell">
      {renderHeader()}
      <main className="page-wrapper">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentListPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/schedule" element={<RaceSchedulePage />} />
          <Route path="/live-results" element={<LiveResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Spectator Role Routes */}
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

          
          <Route
            path="/jockey"
            element={<Navigate to="/jockey/invitations" replace />}
          />
          <Route
            path="/jockey/invitations"
            element={<JockeyInvitationPage />}
          />
          <Route
            path="/jockey/schedule"
            element={<JockeySchedulePage />}
          />
          <Route
            path="/jockey/performance"
            element={<JockeyPerformancePage />}
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