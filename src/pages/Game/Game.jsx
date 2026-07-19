import { useEffect, useReducer, useState } from "react";

import "./Game.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Board from "../../components/Board/Board.jsx";
import Rack from "../../components/Rack/Rack.jsx";
import Button from "../../components/Button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createBag, drawTiles, RACK_SIZE, LETTER_VALUES } from "../../game/letters.js";
import { createEmptyBoard, isStructurallyValid } from "../../game/board.js";
import * as gameApi from "../../api/game.js";

const TURN_SECONDS = 90;
const MAX_CONSECUTIVE_PASSES = 4;

let nextTileId = 1;
function tagTiles(tiles) {
  return tiles.map((tile) => ({ ...tile, id: nextTileId++ }));
}

function rackValue(rack) {
  return rack.reduce((sum, tile) => sum + (tile.isBlank ? 0 : LETTER_VALUES[tile.letter]), 0);
}

function initialState() {
  return {
    phase: "setup",
    playerNames: ["", ""],
    board: createEmptyBoard(),
    bag: [],
    racks: [[], []],
    scores: [0, 0],
    currentPlayer: 0,
    placements: [],
    selectedTileId: null,
    mode: "place",
    exchangeSelection: new Set(),
    consecutivePasses: 0,
    turnSecondsLeft: TURN_SECONDS,
    pendingBlank: null,
    message: "",
    winnerIndex: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "START_GAME": {
      const bag = createBag();
      const { drawn: rack0, remaining: afterP0 } = drawTiles(bag, RACK_SIZE);
      const { drawn: rack1, remaining: afterP1 } = drawTiles(afterP0, RACK_SIZE);
      return {
        ...initialState(),
        phase: "playing",
        playerNames: [action.player1Name, action.player2Name],
        bag: afterP1,
        racks: [tagTiles(rack0), tagTiles(rack1)],
      };
    }

    case "SELECT_RACK_TILE": {
      if (state.mode === "exchange") {
        const next = new Set(state.exchangeSelection);
        if (next.has(action.tileId)) next.delete(action.tileId);
        else next.add(action.tileId);
        return { ...state, exchangeSelection: next };
      }
      return {
        ...state,
        selectedTileId: state.selectedTileId === action.tileId ? null : action.tileId,
      };
    }

    case "PLACE_TILE": {
      const { row, col } = action;
      if (state.board[row][col]) return state;
      if (state.placements.some((p) => p.row === row && p.col === col)) return state;

      const rack = state.racks[state.currentPlayer];
      const tile = rack.find((t) => t.id === state.selectedTileId);
      if (!tile) return state;

      if (tile.isBlank) {
        return { ...state, pendingBlank: { row, col, rackTileId: tile.id } };
      }

      return {
        ...state,
        placements: [...state.placements, { row, col, letter: tile.letter, isBlank: false, rackTileId: tile.id }],
        selectedTileId: null,
      };
    }

    case "PICK_UP_TILE": {
      const { row, col } = action;
      return {
        ...state,
        placements: state.placements.filter((p) => !(p.row === row && p.col === col)),
      };
    }

    case "CONFIRM_BLANK_LETTER": {
      if (!state.pendingBlank) return state;
      const { row, col, rackTileId } = state.pendingBlank;
      return {
        ...state,
        placements: [...state.placements, { row, col, letter: action.letter, isBlank: true, rackTileId }],
        selectedTileId: null,
        pendingBlank: null,
      };
    }

    case "CANCEL_BLANK": {
      return { ...state, pendingBlank: null };
    }

    case "SET_MODE": {
      return {
        ...state,
        mode: action.mode,
        placements: [],
        selectedTileId: null,
        exchangeSelection: new Set(),
      };
    }

    case "MOVE_REJECTED": {
      return { ...state, placements: [], selectedTileId: null, message: action.reason };
    }

    case "MOVE_ACCEPTED": {
      const { words, score } = action;
      const board = state.board.map((r) => [...r]);
      for (const p of state.placements) {
        board[p.row][p.col] = { letter: p.letter, isBlank: p.isBlank };
      }

      const placedIds = new Set(state.placements.map((p) => p.rackTileId));
      const remainingRack = state.racks[state.currentPlayer].filter((t) => !placedIds.has(t.id));
      const { drawn, remaining: bag } = drawTiles(state.bag, RACK_SIZE - remainingRack.length);
      const newRack = [...remainingRack, ...tagTiles(drawn)];

      const racks = [...state.racks];
      racks[state.currentPlayer] = newRack;

      const scores = [...state.scores];
      scores[state.currentPlayer] += score;

      const gameOver = bag.length === 0 && newRack.length === 0;

      const nextState = {
        ...state,
        board,
        bag,
        racks,
        scores,
        placements: [],
        selectedTileId: null,
        consecutivePasses: 0,
        turnSecondsLeft: TURN_SECONDS,
        message: `${state.playerNames[state.currentPlayer]} forme ${words.join(", ")} pour ${score} points.`,
      };

      if (gameOver) {
        return endGame(nextState, state.currentPlayer);
      }

      return { ...nextState, currentPlayer: state.currentPlayer === 0 ? 1 : 0 };
    }

    case "EXCHANGE_TILES": {
      const rack = state.racks[state.currentPlayer];
      const toExchange = rack.filter((t) => state.exchangeSelection.has(t.id));
      const keep = rack.filter((t) => !state.exchangeSelection.has(t.id));
      const bagWithReturns = [...state.bag, ...toExchange.map(({ letter, isBlank }) => ({ letter, isBlank }))];
      const { drawn, remaining: bag } = drawTiles(bagWithReturns, toExchange.length);

      const racks = [...state.racks];
      racks[state.currentPlayer] = [...keep, ...tagTiles(drawn)];

      const consecutivePasses = state.consecutivePasses + 1;
      const nextState = {
        ...state,
        bag,
        racks,
        mode: "place",
        exchangeSelection: new Set(),
        consecutivePasses,
        turnSecondsLeft: TURN_SECONDS,
        message: `${state.playerNames[state.currentPlayer]} échange ${toExchange.length} lettre(s).`,
      };

      if (consecutivePasses >= MAX_CONSECUTIVE_PASSES) {
        return endGame(nextState, null);
      }

      return { ...nextState, currentPlayer: state.currentPlayer === 0 ? 1 : 0 };
    }

    case "PASS_TURN": {
      const consecutivePasses = state.consecutivePasses + 1;
      const nextState = {
        ...state,
        placements: [],
        selectedTileId: null,
        consecutivePasses,
        turnSecondsLeft: TURN_SECONDS,
        message: `${state.playerNames[state.currentPlayer]} passe son tour.`,
      };

      if (consecutivePasses >= MAX_CONSECUTIVE_PASSES) {
        return endGame(nextState, null);
      }

      return { ...nextState, currentPlayer: state.currentPlayer === 0 ? 1 : 0 };
    }

    case "TICK_TIMER": {
      if (state.turnSecondsLeft <= 1) {
        return reducer(state, { type: "PASS_TURN" });
      }
      return { ...state, turnSecondsLeft: state.turnSecondsLeft - 1 };
    }

    default:
      return state;
  }
}

function endGame(state, playerWhoEmptiedRack) {
  const scores = [...state.scores];

  if (playerWhoEmptiedRack !== null) {
    const otherPlayer = playerWhoEmptiedRack === 0 ? 1 : 0;
    const otherRackValue = rackValue(state.racks[otherPlayer]);
    scores[playerWhoEmptiedRack] += otherRackValue;
    scores[otherPlayer] -= otherRackValue;
  } else {
    scores[0] -= rackValue(state.racks[0]);
    scores[1] -= rackValue(state.racks[1]);
  }

  const winnerIndex = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;

  return { ...state, phase: "finished", scores, winnerIndex };
}

function Game() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [player1Input, setPlayer1Input] = useState("");
  const [player2Input, setPlayer2Input] = useState("");
  const [blankLetterChoice, setBlankLetterChoice] = useState("A");

  useEffect(() => {
    if (state.phase !== "playing") return undefined;
    const timer = setInterval(() => dispatch({ type: "TICK_TIMER" }), 1000);
    return () => clearInterval(timer);
  }, [state.phase, state.currentPlayer]);

  useEffect(() => {
    if (state.phase !== "finished") return;
    if (state.winnerIndex === null) return;
    if (!user) return;
    gameApi.recordResult(state.winnerIndex === 0 ? "win" : "loss", state.scores[0]).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  async function handleValidate() {
    const result = await gameApi.validateMove(state.board, state.placements);
    if (result.accepted) {
      dispatch({ type: "MOVE_ACCEPTED", words: result.words, score: result.score });
    } else {
      dispatch({ type: "MOVE_REJECTED", reason: result.reason });
    }
  }

  if (state.phase === "setup") {
    const player1Name = user?.username || player1Input;
    const canStart = player1Name.trim() !== "" && player2Input.trim() !== "";

    return (
      <AppLayout>
        <div className="game-setup">
          <h1>Nouvelle partie</h1>
          {user ? (
            <p>{user.username} affronte :</p>
          ) : (
            <>
              <p>Partie en invité — aucun compte requis.</p>
              <input
                type="text"
                placeholder="Nom du joueur 1"
                value={player1Input}
                onChange={(e) => setPlayer1Input(e.target.value)}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Nom du joueur 2"
            value={player2Input}
            onChange={(e) => setPlayer2Input(e.target.value)}
          />
          <Button
            text="Commencer"
            disabled={!canStart}
            onClick={() => dispatch({ type: "START_GAME", player1Name, player2Name: player2Input })}
          />
        </div>
      </AppLayout>
    );
  }

  if (state.phase === "finished") {
    return (
      <AppLayout>
        <div className="game-finished">
          <h1>Partie terminée</h1>
          <p className="game-final-scores">
            {state.playerNames[0]} : {state.scores[0]} pts — {state.playerNames[1]} : {state.scores[1]} pts
          </p>
          <p>
            {state.winnerIndex === null
              ? "Égalité !"
              : `${state.playerNames[state.winnerIndex]} remporte la partie !`}
          </p>
        </div>
      </AppLayout>
    );
  }

  const currentRack = state.racks[state.currentPlayer].filter(
    (t) => !state.placements.some((p) => p.rackTileId === t.id)
  );
  const canValidate = state.placements.length > 0 && isStructurallyValid(state.board, state.placements);

  return (
    <AppLayout>
      <div className="game-page">
        <h1 className="visually-hidden">Partie en cours — Lexora</h1>
        <div className="game-status">
          <div className="game-scores">
            <span className={state.currentPlayer === 0 ? "game-score is-active" : "game-score"}>
              {state.playerNames[0]} : {state.scores[0]}
            </span>
            <span className={state.currentPlayer === 1 ? "game-score is-active" : "game-score"}>
              {state.playerNames[1]} : {state.scores[1]}
            </span>
          </div>
          <div className="game-timer">{state.turnSecondsLeft}s</div>
        </div>

        {state.message && <p className="game-message">{state.message}</p>}

        <Board
          board={state.board}
          placements={state.placements}
          onCellClick={(row, col) => {
            if (state.placements.some((p) => p.row === row && p.col === col)) {
              dispatch({ type: "PICK_UP_TILE", row, col });
            } else {
              dispatch({ type: "PLACE_TILE", row, col });
            }
          }}
        />

        <Rack
          tiles={currentRack}
          selectedTileId={state.selectedTileId}
          exchangeSelection={state.exchangeSelection}
          mode={state.mode}
          onTileClick={(tileId) => dispatch({ type: "SELECT_RACK_TILE", tileId })}
        />

        <div className="game-actions">
          {state.mode === "place" ? (
            <>
              <Button text="Valider" disabled={!canValidate} onClick={handleValidate} />
              <button
                type="button"
                className="game-secondary-action"
                onClick={() => dispatch({ type: "SET_MODE", mode: "exchange" })}
              >
                Échanger des lettres
              </button>
              <button
                type="button"
                className="game-secondary-action"
                onClick={() => dispatch({ type: "PASS_TURN" })}
              >
                Passer
              </button>
            </>
          ) : (
            <>
              <Button
                text="Confirmer l'échange"
                disabled={state.exchangeSelection.size === 0}
                onClick={() => dispatch({ type: "EXCHANGE_TILES" })}
              />
              <button
                type="button"
                className="game-secondary-action"
                onClick={() => dispatch({ type: "SET_MODE", mode: "place" })}
              >
                Annuler
              </button>
            </>
          )}
        </div>

        {state.pendingBlank && (
          <div
            className="blank-picker-overlay"
            onKeyDown={(e) => e.key === "Escape" && dispatch({ type: "CANCEL_BLANK" })}
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
                  onClick={() => dispatch({ type: "CONFIRM_BLANK_LETTER", letter: blankLetterChoice })}
                />
                <button
                  type="button"
                  className="game-secondary-action"
                  onClick={() => dispatch({ type: "CANCEL_BLANK" })}
                >
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

export default Game;
