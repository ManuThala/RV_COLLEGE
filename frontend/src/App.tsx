import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HowToPlayPage from "./pages/HowToPlayPage";
import RegisterPage from "./pages/RegisterPage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";
import TeamDashboardPage from "./pages/TeamDashboardPage";
import RulesAcceptancePage from "./pages/RulesAcceptancePage";
import RulesPage from "./pages/RulesPage";
import GamePage from "./pages/GamePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import WinnerPage from "./pages/WinnerPage";
import FinalResultsPage from "./pages/FinalResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/registration-success"
          element={<RegistrationSuccessPage />}
        />
        <Route path="/team-dashboard" element={<TeamDashboardPage />} />
        <Route path="/rules-acceptance" element={<RulesAcceptancePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/challenge" element={<GamePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/winner" element={<WinnerPage />} />
        <Route path="/results" element={<FinalResultsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
