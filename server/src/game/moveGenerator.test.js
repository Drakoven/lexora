import { describe, it, expect } from "vitest";
import { generateMoves } from "./moveGenerator.js";
import { validateMove } from "./scoring.js";
import { createEmptyBoard, CENTER } from "./board.js";

function tiles(letters) {
  return letters.split("").map((letter) => ({ letter, isBlank: false }));
}

describe("generateMoves — plateau vide", () => {
  it("ne propose que des coups qui couvrent la case centrale", () => {
    const board = createEmptyBoard();
    const candidates = generateMoves(board, tiles("CHATOIR"));
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      const coversCenter = candidate.placements.some(
        (p) => p.row === CENTER.row && p.col === CENTER.col
      );
      expect(coversCenter).toBe(true);
    }
  });

  it("trie les candidats par score décroissant", () => {
    const board = createEmptyBoard();
    const candidates = generateMoves(board, tiles("CHATOIR"));
    for (let i = 1; i < candidates.length; i++) {
      expect(candidates[i].score).toBeLessThanOrEqual(candidates[i - 1].score);
    }
  });
});

describe("generateMoves — extension d'un mot existant sans espace", () => {
  // Cas critique corrigé avant implémentation (voir getSeedNode) : sans lui,
  // le générateur ne peut jamais prolonger un mot existant sans espace.
  it("trouve CHATS en prolongeant CHAT déjà posé sur le plateau", () => {
    const board = createEmptyBoard();
    board[7][6] = { letter: "C", isBlank: false };
    board[7][7] = { letter: "H", isBlank: false };
    board[7][8] = { letter: "A", isBlank: false };
    board[7][9] = { letter: "T", isBlank: false };

    const candidates = generateMoves(board, tiles("SZXQWKY"));
    const foundChats = candidates.some((c) => c.words.includes("CHATS"));
    expect(foundChats).toBe(true);
  });
});

describe("generateMoves — cohérence avec validateMove", () => {
  it("chaque candidat proposé est lui-même accepté par validateMove", () => {
    const board = createEmptyBoard();
    board[7][6] = { letter: "C", isBlank: false };
    board[7][7] = { letter: "H", isBlank: false };
    board[7][8] = { letter: "A", isBlank: false };
    board[7][9] = { letter: "T", isBlank: false };

    const candidates = generateMoves(board, tiles("SERONTA"));
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      const result = validateMove(board, candidate.placements);
      expect(result.accepted).toBe(true);
      expect(result.score).toBe(candidate.score);
    }
  });

  it("ne propose aucun doublon de placement", () => {
    const board = createEmptyBoard();
    const candidates = generateMoves(board, tiles("CHATOIR"));
    const keys = candidates.map((c) =>
      [...c.placements]
        .sort((a, b) => a.row - b.row || a.col - b.col)
        .map((p) => `${p.row},${p.col},${p.letter},${p.isBlank}`)
        .join("|")
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("generateMoves — jokers", () => {
  it("marque isBlank:true sur les placements utilisant un joker", () => {
    const board = createEmptyBoard();
    const rack = [
      { letter: "C", isBlank: false },
      { letter: "H", isBlank: false },
      { letter: "A", isBlank: false },
      { letter: null, isBlank: true },
    ];
    const candidates = generateMoves(board, rack);
    const usesBlank = candidates.some((c) => c.placements.some((p) => p.isBlank));
    expect(usesBlank).toBe(true);
  });
});
