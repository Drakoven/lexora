import { useNavigate } from "react-router-dom";

import "./Dashboard.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Button from "../../components/Button/Button.jsx";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="dashboard-page">
        <h1>Jouer</h1>

        <div className="dashboard-play-options">
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
