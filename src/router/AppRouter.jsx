import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Game from "../pages/Game/Game";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import OnlineLobby from "../pages/OnlineLobby/OnlineLobby";
import OnlineGame from "../pages/OnlineGame/OnlineGame";
import RequireAuth from "../components/RequireAuth/RequireAuth";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/game"
          element={
            <RequireAuth>
              <Game />
            </RequireAuth>
          }
        />
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