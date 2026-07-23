import { useEffect, useState } from "react";

import "../Game/Game.css";
import "./DailyChallenge.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Board from "../../components/Board/Board.jsx";
import Rack from "../../components/Rack/Rack.jsx";
import Button from "../../components/Button/Button.jsx";
import WordDefinition from "../../components/WordDefinition/WordDefinition.jsx";
import { LETTER_VALUES } from "../../game/letters.js";
import { isStructurallyValid } from "../../game/board.js";
import * as dailyChallengeApi from "../../api/dailyChallenge.js";

let nextTileId = 1;
function tagTiles(tiles) {
  return tiles.map((tile) => ({ ...tile, id: nextTileId++ }));
}

function DailyChallenge() {
  const [phase, setPhase] = useState("loading"); // loading | unavailable | playing | result
  const [board, setBoard] = useState(null);
  const [rack, setRack] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [pendingBlank, setPendingBlank] = useState(null);
  const [blankLetterChoice, setBlankLetterChoice] = useState("A");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dailyChallengeApi
      .getTodaysChallenge()
      .then((data) => {
        if (!data.available) {
          setPhase("unavailable");
        } else if (data.alreadyPlayed) {
          setResult(data);
          setPhase("result");
        } else {
          setBoard(data.board);
          setRack(tagTiles(data.rack));
          setPhase("playing");
        }
      })
      .catch(() => setPhase("unavailable"));
  }, []);

  if (phase === "loading") {
    return (
      <AppLayout>
        <div className="game-page">
          <h1>Défi du jour</h1>
          <p className="game-message">Chargement...</p>
        </div>
      </AppLayout>
    );
  }

  if (phase === "unavailable") {
    return (
      <AppLayout>
        <div className="game-page">
          <h1>Défi du jour</h1>
          <p className="game-message">
            Aucun défi disponible pour l'instant — reviens un peu plus tard, le temps que
            davantage de parties aient été jouées sur Lexora.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (phase === "result") {
    return (
      <AppLayout>
        <div className="game-page">
          <h1>Défi du jour</h1>
          <div className={result.won ? "daily-challenge-result is-won" : "daily-challenge-result"}>
            <p className="daily-challenge-result-title">
              {result.won ? "Bravo, tu as fait mieux !" : "Pas cette fois !"}
            </p>
            <div>
              Ton coup : <strong>{result.yourScore} points</strong>
              {result.words && result.words.length > 0 && (
                <>
                  {" "}
                  (
                  {result.words.map((word, i) => (
                    <span key={word + i}>
                      {i > 0 && ", "}
                      <WordDefinition word={word} />
                    </span>
                  ))}
                  )
                </>
              )}
            </div>
            <p>
              Le coup original : <strong>{result.targetScore} points</strong>
            </p>
          </div>
          <p className="game-message">Reviens demain pour un nouveau défi.</p>
        </div>
      </AppLayout>
    );
  }

  const availableTiles = rack.filter((t) => !placements.some((p) => p.rackTileId === t.id));
  const canValidate = placements.length > 0 && isStructurallyValid(board, placements);

  function handleCellClick(row, col) {
    if (placements.some((p) => p.row === row && p.col === col)) {
      setPlacements(placements.filter((p) => !(p.row === row && p.col === col)));
      return;
    }
    if (board[row][col]) return;

    const tile = availableTiles.find((t) => t.id === selectedTileId);
    if (!tile) return;

    if (tile.isBlank) {
      setPendingBlank({ row, col, rackTileId: tile.id });
      return;
    }

    setPlacements([...placements, { row, col, letter: tile.letter, isBlank: false, rackTileId: tile.id }]);
    setSelectedTileId(null);
  }

  function handleTileClick(tileId) {
    setSelectedTileId(selectedTileId === tileId ? null : tileId);
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const cleanPlacements = placements.map(({ row, col, letter, isBlank }) => ({ row, col, letter, isBlank }));
      const data = await dailyChallengeApi.submitDailyChallenge(cleanPlacements);
      if (data.rejected) {
        setError(data.rejected);
      } else {
        setResult(data);
        setPhase("result");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="game-page">
        <h1>Défi du jour</h1>
        <p className="game-message">
          Un vrai coup déjà joué sur Lexora. Forme le meilleur mot possible avec ce chevalet
          pour battre le score obtenu à l'époque — une seule tentative par jour.
        </p>

        {error && <p className="game-message game-message-error" role="alert">{error}</p>}

        <Board board={board} placements={placements} onCellClick={handleCellClick} />

        <Rack
          tiles={availableTiles}
          selectedTileId={selectedTileId}
          exchangeSelection={new Set()}
          mode="place"
          onTileClick={handleTileClick}
        />

        <div className="game-actions">
          <Button
            text={submitting ? "Validation..." : "Valider"}
            disabled={!canValidate || submitting}
            onClick={handleSubmit}
          />
        </div>

        {pendingBlank && (
          <div
            className="blank-picker-overlay"
            onKeyDown={(e) => e.key === "Escape" && setPendingBlank(null)}
          >
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
                      { row: pendingBlank.row, col: pendingBlank.col, letter: blankLetterChoice, isBlank: true, rackTileId: pendingBlank.rackTileId },
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

export default DailyChallenge;
