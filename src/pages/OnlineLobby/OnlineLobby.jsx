import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./OnlineLobby.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Button from "../../components/Button/Button.jsx";
import * as gamesApi from "../../api/games.js";

const STATUS_LABELS = {
  waiting: "En attente d'un adversaire",
  playing: "En cours",
  finished: "Terminée",
};

function OnlineLobby() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [games, setGames] = useState([]);

  useEffect(() => {
    gamesApi.listGames().then(setGames);
  }, []);

  async function handleCreate() {
    setError("");
    setIsBusy(true);
    try {
      const game = await gamesApi.createGame();
      navigate(`/play/online/${game.code}`);
    } catch (err) {
      setError(err.message);
      setIsBusy(false);
    }
  }

  async function handleRandomMatch() {
    setError("");
    setIsBusy(true);
    try {
      const game = await gamesApi.findRandomMatch();
      navigate(`/play/online/${game.code}`);
    } catch (err) {
      setError(err.message);
      setIsBusy(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (joinCode.trim() === "") return;

    setError("");
    setIsBusy(true);
    try {
      const game = await gamesApi.joinGame(joinCode.trim().toUpperCase());
      navigate(`/play/online/${game.code}`);
    } catch (err) {
      setError(err.message);
      setIsBusy(false);
    }
  }

  return (
    <AppLayout>
      <div className="online-lobby">
        <h1>Partie en ligne</h1>

        {games.length > 0 && (
          <section className="online-lobby-card">
            <h2>Tes parties en cours</h2>
            <ul className="online-lobby-games">
              {games.map((game) => (
                <li key={game.code}>
                  <button type="button" className="online-lobby-game-row" onClick={() => navigate(`/play/online/${game.code}`)}>
                    <span>
                      {game.opponent ? game.opponent.username : "En attente d'un adversaire"}
                      {" — "}
                      {STATUS_LABELS[game.status]}
                    </span>
                    {game.isYourTurn && <span className="online-lobby-your-turn">À toi de jouer</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="online-lobby-card">
          <h2>Adversaire aléatoire</h2>
          <p>On te trouve un adversaire disponible, ou tu attends qu'un autre joueur cherche aussi.</p>
          <Button text="Trouver une partie" disabled={isBusy} onClick={handleRandomMatch} />
        </section>

        <section className="online-lobby-card">
          <h2>Créer une salle</h2>
          <p>Tu obtiens un code à partager avec ton adversaire.</p>
          <Button text="Créer une salle" disabled={isBusy} onClick={handleCreate} />
        </section>

        <section className="online-lobby-card">
          <h2>Rejoindre une salle</h2>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Code de la salle"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={6}
            />
            {error && <p className="online-lobby-error">{error}</p>}
            <Button text="Rejoindre" disabled={isBusy} />
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

export default OnlineLobby;
