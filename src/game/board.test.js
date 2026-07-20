import { describe, expect, it } from "vitest";
import { BOARD_SIZE, CENTER, createEmptyBoard, getBonus, isStructurallyValid } from "./board.js";

describe("getBonus", () => {
  it("marque les 4 coins et le centre comme triple mot", () => {
    expect(getBonus(0, 0)).toBe("TW");
    expect(getBonus(0, 14)).toBe("TW");
    expect(getBonus(14, 0)).toBe("TW");
    expect(getBonus(14, 14)).toBe("TW");
    expect(getBonus(CENTER.row, CENTER.col)).toBe("DW");
  });

  it("renvoie null pour une case sans bonus", () => {
    expect(getBonus(1, 0)).toBeNull();
  });
});

describe("createEmptyBoard", () => {
  it("crée une grille 15x15 entièrement vide", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_SIZE);
    expect(board.every((row) => row.length === BOARD_SIZE)).toBe(true);
    expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it("renvoie une nouvelle grille indépendante à chaque appel", () => {
    const a = createEmptyBoard();
    const b = createEmptyBoard();
    a[0][0] = "A";
    expect(b[0][0]).toBeNull();
  });
});

describe("isStructurallyValid", () => {
  it("rejette un placement vide", () => {
    expect(isStructurallyValid(createEmptyBoard(), [])).toBe(false);
  });

  it("accepte une seule lettre posée n'importe où", () => {
    const board = createEmptyBoard();
    expect(isStructurallyValid(board, [{ row: 7, col: 7, letter: "A" }])).toBe(true);
  });

  it("accepte un mot horizontal contigu", () => {
    const board = createEmptyBoard();
    const placements = [
      { row: 7, col: 6, letter: "C" },
      { row: 7, col: 7, letter: "A" },
      { row: 7, col: 8, letter: "T" },
    ];
    expect(isStructurallyValid(board, placements)).toBe(true);
  });

  it("accepte un mot vertical contigu", () => {
    const board = createEmptyBoard();
    const placements = [
      { row: 6, col: 7, letter: "C" },
      { row: 7, col: 7, letter: "A" },
      { row: 8, col: 7, letter: "T" },
    ];
    expect(isStructurallyValid(board, placements)).toBe(true);
  });

  it("rejette des lettres qui ne sont ni sur une même ligne ni une même colonne", () => {
    const board = createEmptyBoard();
    const placements = [
      { row: 7, col: 7, letter: "A" },
      { row: 8, col: 8, letter: "B" },
    ];
    expect(isStructurallyValid(board, placements)).toBe(false);
  });

  it("rejette un mot horizontal avec un trou non comblé par le plateau", () => {
    const board = createEmptyBoard();
    const placements = [
      { row: 7, col: 6, letter: "C" },
      { row: 7, col: 8, letter: "T" },
    ];
    expect(isStructurallyValid(board, placements)).toBe(false);
  });

  it("accepte un trou comblé par une lettre déjà posée sur le plateau", () => {
    const board = createEmptyBoard();
    board[7][7] = { letter: "A" };
    const placements = [
      { row: 7, col: 6, letter: "C" },
      { row: 7, col: 8, letter: "T" },
    ];
    expect(isStructurallyValid(board, placements)).toBe(true);
  });
});
