import { NavLink, useNavigate } from "react-router-dom";

import "./AppLayout.css";
import { useAuth } from "../../context/AuthContext.jsx";
import VerifyEmailBanner from "../VerifyEmailBanner/VerifyEmailBanner.jsx";

function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    navigate("/");
    await logout();
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <NavLink to="/" className="app-logo">
          LEXORA
        </NavLink>

        <nav className="app-nav">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "app-nav-link is-active" : "app-nav-link"
                }
              >
                Tableau de bord
              </NavLink>
              <NavLink
                to="/friends"
                className={({ isActive }) =>
                  isActive ? "app-nav-link is-active" : "app-nav-link"
                }
              >
                Amis
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  isActive ? "app-nav-link is-active" : "app-nav-link"
                }
              >
                Classement
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "app-nav-link is-active" : "app-nav-link"
                }
              >
                Profil
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive ? "app-nav-link is-active" : "app-nav-link"
                }
              >
                Paramètres
              </NavLink>

              <button className="app-logout-button" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <NavLink to="/login" className="app-nav-link">
              Se connecter
            </NavLink>
          )}
        </nav>
      </header>

      {user && !user.emailVerified && <VerifyEmailBanner />}

      <main className="app-content">{children}</main>

      <footer className="app-footer">
        <NavLink to="/mentions-legales">Mentions légales</NavLink>
        <NavLink to="/politique-de-confidentialite">Politique de confidentialité</NavLink>
      </footer>
    </div>
  );
}

export default AppLayout;
