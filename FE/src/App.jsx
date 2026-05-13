import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import TournamentListPage from "./pages/TournamentListPage/TournamentListPage";
import TournamentDetailPage from "./pages/TournamentDetailPage/TournamentDetailPage";
import RaceSchedulePage from "./pages/RaceSchedulePage/RaceSchedulePage";
import LiveResultsPage from "./pages/LiveResultsPage/LiveResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage/LeaderboardPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tournaments" element={<TournamentListPage />} />
            <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
            <Route path="/schedule" element={<RaceSchedulePage />} />
            <Route path="/live-results" element={<LiveResultsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
