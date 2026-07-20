import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import MentionsLegales from "../pages/MentionsLegales/MentionsLegales";
import PolitiqueConfidentialite from "../pages/PolitiqueConfidentialite/PolitiqueConfidentialite";
import ConditionsUtilisation from "../pages/ConditionsUtilisation/ConditionsUtilisation";
import CommentJouer from "../pages/CommentJouer/CommentJouer";
import Dashboard from "../pages/Dashboard/Dashboard";
import Game from "../pages/Game/Game";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import OnlineLobby from "../pages/OnlineLobby/OnlineLobby";
import OnlineGame from "../pages/OnlineGame/OnlineGame";
import Friends from "../pages/Friends/Friends";
import Leaderboard from "../pages/Leaderboard/Leaderboard";
import Badges from "../pages/Badges/Badges";
import RequireAuth from "../components/RequireAuth/RequireAuth";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
        <Route path="/comment-jouer" element={<CommentJouer />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/game" element={<Game />} />
        <Route
          path="/play/online"
          element={
            <RequireAuth>
              <OnlineLobby />
            </RequireAuth>
          }
        />
        <Route
          path="/play/online/:code"
          element={
            <RequireAuth>
              <OnlineGame />
            </RequireAuth>
          }
        />
        <Route
          path="/friends"
          element={
            <RequireAuth>
              <Friends />
            </RequireAuth>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RequireAuth>
              <Leaderboard />
            </RequireAuth>
          }
        />
        <Route
          path="/badges"
          element={
            <RequireAuth>
              <Badges />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;