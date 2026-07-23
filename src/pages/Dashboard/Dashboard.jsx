import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import "./Dashboard.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Button from "../../components/Button/Button.jsx";

const WELCOME_DISMISSED_KEY = "lexora_dashboard_welcome_dismissed";

function Dashboard() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(
    () => localStorage.getItem(WELCOME_DISMISSED_KEY) !== "1"
  );

  function dismissWelcome() {
    localStorage.setItem(WELCOME_DISMISSED_KEY, "1");
    setShowWelcome(false);
  }

  return (
    <AppLayout>
      <div className="dashboard-page">
        <h1>Jouer</h1>

        {showWelcome && (
          <section className="dashboard-welcome-card">
            <button
              className="dashboard-welcome-dismiss"
              onClick={dismissWelcome}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2>Nouveau sur Lexora ?</h2>
            <p>
              Découvre les règles du jeu, ou entraîne-toi directement contre notre bot avant
              d'affronter d'autres joueurs.
            </p>
            <div className="dashboard-welcome-actions">
              <Link to="/comment-jouer" className="dashboard-welcome-link">
                Voir les règles
              </Link>
              <Button text="Jouer contre le bot" onClick={() => navigate("/play/online")} />
            </div>
          </section>
        )}

        <div className="dashboard-play-options">
          <section className="dashboard-play-card">
            <h2>Défi du jour</h2>
            <p>Bats le score d'un vrai coup déjà joué sur Lexora. Une tentative par jour.</p>
            <Button text="Jouer le défi" onClick={() => navigate("/daily-challenge")} />
          </section>

          <section className="dashboard-play-card">
            <h2>Partie locale</h2>
            <p>Deux joueurs sur le même appareil, à tour de rôle.</p>
            <Button text="Jouer en local" onClick={() => navigate("/game")} />
          </section>

          <section className="dashboard-play-card">
            <h2>Partie en ligne</h2>
            <p>Affronte un ami en temps réel, chacun sur son appareil.</p>
            <Button text="Jouer en ligne" onClick={() => navigate("/play/online")} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
