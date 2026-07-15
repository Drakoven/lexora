import { BOARD_SIZE } from "./letters.js";

export { BOARD_SIZE };

const TRIPLE_WORD = [
  [0, 0], [0, 7], [0, 14],
  [7, 0], [7, 14],
  [14, 0], [14, 7], [14, 14],
];

const DOUBLE_WORD = [
  [1, 1], [2, 2], [3, 3], [4, 4],
  [10, 10], [11, 11], [12, 12], [13, 13],
  [1, 13], [2, 12], [3, 11], [4, 10],
  [13, 1], [12, 2], [11, 3], [10, 4],
  [7, 7],
];

const TRIPLE_LETTER = [
  [1, 5], [1, 9],
  [5, 1], [5, 5], [5, 9], [5, 13],
  [9, 1], [9, 5], [9, 9], [9, 13],
  [13, 5], [13, 9],
];

const DOUBLE_LETTER = [
  [0, 3], [0, 11],
  [2, 6], [2, 8],
  [3, 0], [3, 7], [3, 14],
  [6, 2], [6, 6], [6, 8], [6, 12],
  [7, 3], [7, 11],
  [8, 2], [8, 6], [8, 8], [8, 12],
  [11, 0], [11, 7], [11, 14],
  [12, 6], [12, 8],
  [14, 3], [14, 11],
];

function buildBonusGrid() {
  const grid = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );

  for (const [row, col] of TRIPLE_WORD) grid[row][col] = "TW";
  for (const [row, col] of DOUBLE_WORD) grid[row][col] = "DW";
  for (const [row, col] of TRIPLE_LETTER) grid[row][col] = "TL";
  for (const [row, col] of DOUBLE_LETTER) grid[row][col] = "DL";

  return grid;
}

export const BONUS_GRID = buildBonusGrid();
export const CENTER = { row: 7, col: 7 };

export function getBonus(row, col) {
  return BONUS_GRID[row][col];
}

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
}

// Vérifications structurelles légères côté client (retour instantané avant
// l'appel réseau) : le serveur reste seul juge du mot/dictionnaire/score.
export function isStructurallyValid(board, placements) {
  if (placements.length === 0) return false;

  const rows = new Set(placements.map((p) => p.row));
  const cols = new Set(placements.map((p) => p.col));

  if (placements.length > 1 && rows.size !== 1 && cols.size !== 1) {
    return false;
  }

  const axis = rows.size === 1 ? "horizontal" : "vertical";
  const line = axis === "horizontal" ? [...cols] : [...rows];
  const fixed = axis === "horizontal" ? placements[0].row : placements[0].col;
  line.sort((a, b) => a - b);

  const getCell = (row, col) =>
    placements.some((p) => p.row === row && p.col === col) || board[row]?.[col];

  for (let i = line[0]; i <= line[line.length - 1]; i++) {
    const filled = axis === "horizontal" ? getCell(fixed, i) : getCell(i, fixed);
    if (!filled) return false;
  }

  return true;
}
