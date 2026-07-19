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
  const [botDifficulty, setBotDifficulty] = useState("medium");

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

  async function handleBotGame() {
    setError("");
    setIsBusy(true);
    try {
      const game = await gamesApi.createBotGame(botDifficulty);
      navigate(`/play/online/${game.code}`);
    } catch (err) {
      setError(err.message);
      setIsBusy(false);
    }
  }

  async function handleOpenGame(game) {
    if (game.kind !== "received-invite") {
      navigate(`/play/online/${game.code}`);
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      const joined = await gamesApi.joinGame(game.code);
      navigate(`/play/online/${joined.code}`);
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
                  <button
                    type="button"
                    className="online-lobby-game-row"
                    disabled={isBusy}
                    onClick={() => handleOpenGame(game)}
                  >
                    <span>
                      {game.kind === "received-invite"
                        ? `${game.opponent?.username} t'invite à jouer`
                        : game.kind === "sent-invite"
                        ? `Invitation envoyée à ${game.invitedUser?.username}`
                        : game.opponent
                        ? `${game.opponent.username} — ${STATUS_LABELS[game.status]}`
                        : `En attente d'un adversaire — ${STATUS_LABELS[game.status]}`}
                    </span>
                    {game.kind === "received-invite" && <span className="online-lobby-your-turn">Rejoindre</span>}
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
          <p className="online-lobby-ranked-note">Cette partie compte pour ton classement.</p>
          <Button text="Trouver une partie" disabled={isBusy} onClick={handleRandomMatch} />
        </section>

        <section className="online-lobby-card">
          <h2>Jouer contre un bot</h2>
          <p>Entraîne-toi contre "Lexora Bot" à ton rythme. Partie amicale, sans impact sur ton classement.</p>
          <div className="online-lobby-difficulty">
            <label>
              <input
                type="radio"
                name="bot-difficulty"
                value="easy"
                checked={botDifficulty === "easy"}
                onChange={() => setBotDifficulty("easy")}
              />
              Facile
            </label>
            <label>
              <input
                type="radio"
                name="bot-difficulty"
                value="medium"
                checked={botDifficulty === "medium"}
                onChange={() => setBotDifficulty("medium")}
              />
              Moyen
            </label>
            <label>
              <input
                type="radio"
                name="bot-difficulty"
                value="hard"
                checked={botDifficulty === "hard"}
                onChange={() => setBotDifficulty("hard")}
              />
              Difficile
            </label>
          </div>
          <Button text="Jouer contre le bot" disabled={isBusy} onClick={handleBotGame} />
        </section>

        <section className="online-lobby-card">
          <h2>Créer une salle</h2>
          <p>Tu obtiens un code à partager avec ton adversaire. Partie amicale, sans impact sur ton classement.</p>
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
            {error && <p className="online-lobby-error" role="alert">{error}</p>}
            <Button text="Rejoindre" disabled={isBusy} />
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

export default OnlineLobby;
