import { describe, it, expect } from "vitest";
import { validateMove } from "./scoring.js";
import { createEmptyBoard } from "./board.js";

// La case centrale (7,7) est un bonus MOT×2 (voir board.js) — chaque test
// "premier coup" doit en tenir compte dans le score attendu.

function place(row, col, letter, isBlank = false) {
  return { row, col, letter, isBlank };
}

describe("validateMove — structure du coup", () => {
  it("rejette un coup sans tuile", () => {
    const result = validateMove(createEmptyBoard(), []);
    expect(result.accepted).toBe(false);
  });

  it("rejette deux tuiles sur la même case", () => {
    const board = createEmptyBoard();
    const result = validateMove(board, [place(7, 7, "A"), place(7, 7, "B")]);
    expect(result.accepted).toBe(false);
  });

  it("rejette une case hors du plateau", () => {
    const board = createEmptyBoard();
    const result = validateMove(board, [place(15, 0, "A"), place(15, 1, "B")]);
    expect(result.accepted).toBe(false);
  });

  it("rejette une case déjà occupée", () => {
    const board = createEmptyBoard();
    board[7][7] = { letter: "A", isBlank: false };
    const result = validateMove(board, [place(7, 7, "B"), place(7, 8, "C")]);
    expect(result.accepted).toBe(false);
  });

  it("rejette des tuiles non alignées sur une ligne ou une colonne", () => {
    const board = createEmptyBoard();
    const result = validateMove(board, [place(7, 7, "A"), place(8, 8, "B")]);
    expect(result.accepted).toBe(false);
  });

  it("rejette des tuiles alignées mais avec un trou", () => {
    const board = createEmptyBoard();
    // (7,7) et (7,9) alignés horizontalement mais (7,8) vide entre les deux
    const result = validateMove(board, [place(7, 7, "C"), place(7, 9, "T")]);
    expect(result.accepted).toBe(false);
  });
});

describe("validateMove — premier coup", () => {
  it("rejette un premier coup d'une seule lettre", () => {
    const board = createEmptyBoard();
    const result = validateMove(board, [place(7, 7, "A")]);
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/2 lettres/);
  });

  it("rejette un premier coup qui ne passe pas par la case centrale", () => {
    const board = createEmptyBoard();
    const result = validateMove(board, [place(3, 3, "C"), place(3, 4, "A"), place(3, 5, "T")]);
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/centrale/);
  });

  it("accepte un premier coup valide et double le score via le bonus central", () => {
    const board = createEmptyBoard();
    // CHAT horizontal, H sur la case centrale (7,7)
    const result = validateMove(board, [
      place(7, 6, "C"),
      place(7, 7, "H"),
      place(7, 8, "A"),
      place(7, 9, "T"),
    ]);
    expect(result.accepted).toBe(true);
    expect(result.words).toEqual(["CHAT"]);
    // C=3, H=4, A=1, T=1 = 9, ×2 (case centrale MOT×2) = 18
    expect(result.score).toBe(18);
    expect(result.isBingo).toBe(false);
  });

  it("rejette un mot absent du dictionnaire", () => {
    const board = createEmptyBoard();
    const result = validateMove(board, [place(7, 7, "Z"), place(7, 8, "Z"), place(7, 9, "Z")]);
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/invalide/);
  });
});

describe("validateMove — coups suivants", () => {
  function boardWithChat() {
    const board = createEmptyBoard();
    board[7][6] = { letter: "C", isBlank: false };
    board[7][7] = { letter: "H", isBlank: false };
    board[7][8] = { letter: "A", isBlank: false };
    board[7][9] = { letter: "T", isBlank: false };
    return board;
  }

  it("rejette un coup qui ne touche aucun mot existant", () => {
    const board = boardWithChat();
    const result = validateMove(board, [place(0, 0, "O"), place(0, 1, "R")]);
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/connecter/);
  });

  it("accepte de prolonger un mot existant sans espace (CHAT -> CHATS)", () => {
    const board = boardWithChat();
    const result = validateMove(board, [place(7, 10, "S")]);
    expect(result.accepted).toBe(true);
    expect(result.words).toEqual(["CHATS"]);
  });

  it("valide et score tous les mots formés simultanément (mot principal + perpendiculaire)", () => {
    const board = boardWithChat();
    // Ajoute "AS" en perpendiculaire sur le A de CHAT (7,8), en descendant
    const result = validateMove(board, [place(8, 8, "S")]);
    expect(result.accepted).toBe(true);
    expect(result.words).toEqual(["AS"]);
  });

  it("rejette tout le coup si un mot perpendiculaire est invalide", () => {
    const board = boardWithChat();
    // Le T de CHAT (7,9) + une lettre en dessous formant un mot invalide
    const result = validateMove(board, [place(8, 9, "Q")]);
    expect(result.accepted).toBe(false);
  });
});

describe("validateMove — jokers et bingo", () => {
  it("un joker vaut 0 point pour sa propre lettre, même sur une case bonus", () => {
    const board = createEmptyBoard();
    // Joker joué comme "H" au centre (bonus MOT×2, mais 0 x2 = 0)
    const result = validateMove(board, [
      place(7, 6, "C"),
      place(7, 7, "H", true),
      place(7, 8, "A"),
      place(7, 9, "T"),
    ]);
    expect(result.accepted).toBe(true);
    // C=3, H(joker)=0, A=1, T=1 = 5, ×2 = 10
    expect(result.score).toBe(10);
  });

  it("ajoute le bonus de 50 points quand les 7 tuiles du chevalet sont posées", () => {
    const board = createEmptyBoard();
    // BONJOUR (7 lettres), B sur la case centrale
    const result = validateMove(board, [
      place(7, 7, "B"),
      place(7, 8, "O"),
      place(7, 9, "N"),
      place(7, 10, "J"),
      place(7, 11, "O"),
      place(7, 12, "U"),
      place(7, 13, "R"),
    ]);
    expect(result.accepted).toBe(true);
    expect(result.isBingo).toBe(true);
    // Score de base doublé (case centrale) + 50 de bonus scrabble
    expect(result.score).toBeGreaterThan(50);
  });
});
