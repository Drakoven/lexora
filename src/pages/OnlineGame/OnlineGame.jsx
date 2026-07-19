import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./OnlineGame.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Board from "../../components/Board/Board.jsx";
import Rack from "../../components/Rack/Rack.jsx";
import Button from "../../components/Button/Button.jsx";
import { LETTER_VALUES } from "../../game/letters.js";
import { isStructurallyValid } from "../../game/board.js";
import { socket } from "../../socket.js";
import * as gamesApi from "../../api/games.js";
import { shareOnFacebook } from "../../social/facebookShare.js";

const REACTIONS = ["👍", "😂", "😮", "😢", "🔥", "🤔"];

function availableRackTiles(rack, placements) {
  const remaining = [...rack];
  for (const p of placements) {
    const idx = remaining.findIndex((t) => (p.isBlank ? t.isBlank : !t.isBlank && t.letter === p.letter));
    if (idx !== -1) remaining.splice(idx, 1);
  }
  return remaining.map((tile, i) => ({ ...tile, id: i }));
}

function describeMove(move, playerName) {
  if (move.moveType === "place") {
    return `${playerName} forme ${move.detail.words.join(", ")} pour ${move.score} points.`;
  }
  if (move.moveType === "exchange") {
    return `${playerName} échange ${move.detail.tileCount} lettre(s).`;
  }
  return move.detail?.auto
    ? `${playerName} n'a pas joué à temps, son tour a été passé.`
    : `${playerName} passe son tour.`;
}

function formatRemaining(turnStartedAt, turnHours, now) {
  if (!turnStartedAt) return "";
  const deadline = new Date(turnStartedAt).getTime() + turnHours * 60 * 60 * 1000;
  const remainingMs = deadline - now;
  if (remainingMs <= 0) return "Tour en retard";

  const totalMinutes = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}j ${hours}h restantes`;
  if (hours > 0) return `${hours}h ${minutes}min restantes`;
  return `${minutes}min restantes`;
}

function OnlineGame() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [placements, setPlacements] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [mode, setMode] = useState("place");
  const [exchangeSelection, setExchangeSelection] = useState(new Set());
  const [pendingBlank, setPendingBlank] = useState(null);
  const [blankLetterChoice, setBlankLetterChoice] = useState("A");
  const [error, setError] = useState("");
  const [reactionBubble, setReactionBubble] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [moves, setMoves] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [scorePreview, setScorePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  function refreshGame() {
    gamesApi
      .getGame(code)
      .then((fresh) => {
        setGame(fresh);
        setPlacements([]);
        setSelectedTileId(null);
      })
      .catch((err) => setLoadError(err.message));
    gamesApi.getMoves(code).then(setMoves).catch(() => {});
  }

  useEffect(() => {
    refreshGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("game:watch", { code });

    function onUpdated() {
      refreshGame();
    }
    function onReaction({ emoji }) {
      setReactionBubble(emoji);
      setTimeout(() => setReactionBubble(null), 2000);
    }

    socket.on("game:updated", onUpdated);
    socket.on("game:reaction", onReaction);

    return () => {
      socket.emit("game:unwatch", { code });
      socket.off("game:updated", onUpdated);
      socket.off("game:reaction", onReaction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const availableTiles = useMemo(
    () => (game ? availableRackTiles(game.yourRack, placements) : []),
    [game, placements]
  );

  const placementsKey = useMemo(
    () =>
      [...placements]
        .sort((a, b) => a.row - b.row || a.col - b.col)
        .map((p) => `${p.row},${p.col},${p.letter},${p.isBlank}`)
        .join("|"),
    [placements]
  );

  // scorePreview ne s'affiche que si sa clé correspond aux placements
  // actuels (voir plus bas) — évite d'avoir à "effacer" synchronement l'état
  // dans l'effet quand les placements deviennent invalides, un preview
  // simplement obsolète ne matche plus la clé et disparaît de lui-même.
  useEffect(() => {
    if (!game || !game.isYourTurn || placements.length === 0 || !isStructurallyValid(game.board, placements)) {
      return;
    }

    let cancelled = false;
    const key = placementsKey;
    const timer = setTimeout(() => {
      gamesApi
        .previewMove(code, placements)
        .then((result) => {
          if (!cancelled) setScorePreview(result.accepted ? { key, score: result.score } : null);
        })
        .catch(() => {
          if (!cancelled) setScorePreview(null);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, game, placements, placementsKey]);

  const displayedScorePreview = scorePreview && scorePreview.key === placementsKey ? scorePreview.score : null;

  if (loadError) {
    return (
      <AppLayout>
        <div className="online-game-waiting">
          <h1>Impossible de charger cette partie</h1>
          <p>{loadError}</p>
          <Button text="Retour au tableau de bord" onClick={() => navigate("/dashboard")} />
        </div>
      </AppLayout>
    );
  }

  if (!game) {
    return (
      <AppLayout>
        <div className="online-game-waiting">
          <h1>Chargement...</h1>
        </div>
      </AppLayout>
    );
  }

  if (game.status === "waiting") {
    async function handleCancelSearch() {
      try {
        await gamesApi.cancelGame(code);
      } catch {
        // la partie a peut-être déjà démarré entre-temps, on retourne au lobby dans tous les cas
      }
      navigate("/play/online");
    }

    return (
      <AppLayout>
        <div className="online-game-waiting">
          {game.matchType === "random" ? (
            <>
              <h1>Recherche d'un adversaire...</h1>
              <p>On te connecte dès qu'un autre joueur cherche aussi une partie.</p>
            </>
          ) : (
            <>
              <h1>En attente d'un adversaire</h1>
              <p>Partage ce code :</p>
              <p className="online-game-code">{code}</p>
            </>
          )}
          <button type="button" className="game-secondary-action" onClick={handleCancelSearch}>
            Annuler
          </button>
        </div>
      </AppLayout>
    );
  }

  async function handleToggleAnalysis() {
    if (!showAnalysis && analysis === null) {
      setAnalysisLoading(true);
      setAnalysisError("");
      try {
        setAnalysis(await gamesApi.getAnalysis(code));
      } catch (err) {
        setAnalysisError(err.message);
      } finally {
        setAnalysisLoading(false);
      }
    }
    setShowAnalysis(!showAnalysis);
  }

  function renderAnalysis() {
    return (
      <div className="online-game-analysis">
        <button type="button" className="game-secondary-action" onClick={handleToggleAnalysis}>
          {showAnalysis ? "Masquer l'analyse" : "Voir l'analyse de mes coups"}
        </button>
        {showAnalysis && analysisLoading && <p>Calcul de l'analyse...</p>}
        {showAnalysis && analysisError && <p className="game-message">{analysisError}</p>}
        {showAnalysis && !analysisLoading && analysis && (
          <ul className="online-game-analysis-list">
            {analysis.length === 0 && (
              <li className="online-game-history-empty">Aucun coup de placement à analyser.</li>
            )}
            {analysis.map((entry, i) =>
              entry.bestWords ? (
                <li key={i} className="online-game-analysis-missed">
                  Tu as joué {entry.words.join(", ")} pour {entry.score} points — meilleur coup possible :{" "}
                  {entry.bestWords.join(", ")} pour {entry.bestScore} points.
                </li>
              ) : (
                <li key={i} className="online-game-analysis-optimal">
                  {entry.words.join(", ")} pour {entry.score} points — coup optimal !
                </li>
              )
            )}
          </ul>
        )}
      </div>
    );
  }

  if (game.status === "finished") {
    const isDraw = game.winner === null;
    const resultText = isDraw ? "Égalité !" : `${game.players[game.winner]?.username} remporte la partie !`;
    return (
      <AppLayout>
        <div className="online-game-waiting">
          <h1>Partie terminée</h1>
          <p className="online-game-final-scores">
            {game.players[0]?.username} : {game.scores[0]} pts — {game.players[1]?.username} : {game.scores[1]} pts
          </p>
          <p>{resultText}</p>
          <button
            type="button"
            className="online-game-share-button"
            onClick={() =>
              shareOnFacebook({
                url: "https://lexora-jeu.fr/",
                quote: `Partie de Lexora terminée : ${game.players[0]?.username} ${game.scores[0]} pts — ${game.players[1]?.username} ${game.scores[1]} pts. ${resultText}`,
              })
            }
          >
            Partager sur Facebook
          </button>
          {renderHistory()}
          {renderAnalysis()}
          <Button text="Retour au tableau de bord" onClick={() => navigate("/dashboard")} />
        </div>
      </AppLayout>
    );
  }

  const canValidate = placements.length > 0 && isStructurallyValid(game.board, placements);

  function handleCellClick(row, col) {
    if (!game.isYourTurn) return;
    if (placements.some((p) => p.row === row && p.col === col)) {
      setPlacements(placements.filter((p) => !(p.row === row && p.col === col)));
      return;
    }
    if (game.board[row][col]) return;

    const tile = availableTiles.find((t) => t.id === selectedTileId);
    if (!tile) return;

    if (tile.isBlank) {
      setPendingBlank({ row, col });
      return;
    }

    setPlacements([...placements, { row, col, letter: tile.letter, isBlank: false }]);
    setSelectedTileId(null);
  }

  function handleTileClick(tileId) {
    if (mode === "exchange") {
      const next = new Set(exchangeSelection);
      if (next.has(tileId)) next.delete(tileId);
      else next.add(tileId);
      setExchangeSelection(next);
    } else {
      setSelectedTileId(selectedTileId === tileId ? null : tileId);
    }
  }

  async function handleValidate() {
    setError("");
    try {
      const result = await gamesApi.submitMove(code, placements);
      if (result.accepted) {
        setGame(result.game);
        setPlacements([]);
        setSelectedTileId(null);
      } else {
        setError(result.reason);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExchange() {
    setError("");
    const tiles = availableTiles
      .filter((t) => exchangeSelection.has(t.id))
      .map(({ letter, isBlank }) => ({ letter, isBlank }));
    try {
      const result = await gamesApi.exchangeTiles(code, tiles);
      if (result.accepted) {
        setGame(result.game);
      } else {
        setError(result.reason);
      }
    } catch (err) {
      setError(err.message);
    }
    setMode("place");
    setExchangeSelection(new Set());
  }

  async function handlePass() {
    setError("");
    try {
      const result = await gamesApi.passTurn(code);
      if (result.accepted) setGame(result.game);
      else setError(result.reason);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleClaimVictory() {
    setError("");
    try {
      const result = await gamesApi.claimVictory(code);
      if (result.accepted) setGame(result.game);
    } catch (err) {
      setError(err.message);
    }
  }

  function sendReaction(emoji) {
    socket.emit("game:react", { code, emoji });
  }

  function renderHistory() {
    return (
      <div className="online-game-history">
        <button type="button" className="game-secondary-action" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Masquer l'historique" : "Voir l'historique des coups"}
        </button>
        {showHistory && (
          <ul className="online-game-history-list">
            {moves.length === 0 && <li className="online-game-history-empty">Aucun coup joué pour l'instant.</li>}
            {moves.map((move, i) => (
              <li key={i}>{describeMove(move, game.players[move.playerIndex]?.username)}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="game-page">
        <h1 className="visually-hidden">Partie en ligne — Lexora</h1>
        <div className="game-status">
          <div className="game-scores">
            <span className={game.currentPlayerIndex === 0 ? "game-score is-active" : "game-score"}>
              {game.players[0]?.username} : {game.scores[0]}
            </span>
            <span className={game.currentPlayerIndex === 1 ? "game-score is-active" : "game-score"}>
              {game.players[1]?.username} : {game.scores[1]}
            </span>
          </div>
          <div className="game-status-right">
            <span className="game-bag-count">🎒 {game.bagCount} lettre{game.bagCount !== 1 ? "s" : ""}</span>
            <span className="game-opponent-rack-count">
              🀄 Adversaire : {game.opponentRackSize} lettre{game.opponentRackSize !== 1 ? "s" : ""}
            </span>
            <div className="game-timer">{formatRemaining(game.turnStartedAt, game.turnHours, now)}</div>
          </div>
        </div>

        {game.isOpponentTurnOverdue && (
          <p className="game-message online-game-warning">
            Le tour de ton adversaire est en retard.{" "}
            <button type="button" className="game-secondary-action" onClick={handleClaimVictory}>
              Réclamer la victoire
            </button>
          </p>
        )}

        {error && <p className="game-message" role="alert">{error}</p>}
        {!game.isYourTurn && !error && <p className="game-message">En attente du coup adverse...</p>}
        {reactionBubble && <p className="online-game-reaction-bubble">{reactionBubble}</p>}

        <Board board={game.board} placements={placements} onCellClick={handleCellClick} />

        <Rack
          tiles={availableTiles}
          selectedTileId={selectedTileId}
          exchangeSelection={exchangeSelection}
          mode={mode}
          onTileClick={handleTileClick}
        />

        {mode === "place" && displayedScorePreview !== null && (
          <p className="game-score-preview">
            Ce mot rapporterait {displayedScorePreview} point{displayedScorePreview !== 1 ? "s" : ""}
          </p>
        )}

        <div className="game-actions">
          {mode === "place" ? (
            <>
              <Button text="Valider" disabled={!canValidate || !game.isYourTurn} onClick={handleValidate} />
              <button
                type="button"
                className="game-secondary-action"
                disabled={!game.isYourTurn}
                onClick={() => setMode("exchange")}
              >
                Échanger des lettres
              </button>
              <button
                type="button"
                className="game-secondary-action"
                disabled={!game.isYourTurn}
                onClick={handlePass}
              >
                Passer
              </button>
            </>
          ) : (
            <>
              <Button
                text="Confirmer l'échange"
                disabled={exchangeSelection.size === 0}
                onClick={handleExchange}
              />
              <button type="button" className="game-secondary-action" onClick={() => setMode("place")}>
                Annuler
              </button>
            </>
          )}
        </div>

        <div className="online-game-reactions">
          {REACTIONS.map((emoji) => (
            <button key={emoji} type="button" className="online-game-reaction-button" onClick={() => sendReaction(emoji)}>
              {emoji}
            </button>
          ))}
        </div>

        {renderHistory()}

        {pendingBlank && (
          <div className="blank-picker-overlay" onKeyDown={(e) => e.key === "Escape" && setPendingBlank(null)}>
            <div className="blank-picker" role="dialog" aria-modal="true" aria-labelledby="blank-picker-title">
              <h2 id="blank-picker-title">Quelle lettre pour ce joker ?</h2>
              <select
                autoFocus
                value={blankLetterChoice}
                onChange={(e) => setBlankLetterChoice(e.target.value)}
              >
                {Object.keys(LETTER_VALUES).map((letter) => (
                  <option key={letter} value={letter}>
                    {letter}
                  </option>
                ))}
              </select>
              <div className="blank-picker-actions">
                <Button
                  text="Valider"
                  onClick={() => {
                    setPlacements([
                      ...placements,
                      { row: pendingBlank.row, col: pendingBlank.col, letter: blankLetterChoice, isBlank: true },
                    ]);
                    setSelectedTileId(null);
                    setPendingBlank(null);
                  }}
                />
                <button type="button" className="game-secondary-action" onClick={() => setPendingBlank(null)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default OnlineGame;
