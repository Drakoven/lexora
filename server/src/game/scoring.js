import { LETTER_VALUES, BOARD_SIZE } from "./letters.js";
import { getBonus, CENTER } from "./board.js";
import { isValidWord } from "./dictionary.js";

function cellKey(row, col) {
  return `${row},${col}`;
}

function buildPlacementMap(placements) {
  const map = new Map();
  for (const p of placements) map.set(cellKey(p.row, p.col), p);
  return map;
}

function getCell(board, placementMap, row, col) {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  const placed = placementMap.get(cellKey(row, col));
  if (placed) return { row, col, letter: placed.letter, isBlank: !!placed.isBlank, isNew: true };
  const existing = board[row][col];
  if (existing) return { row, col, letter: existing.letter, isBlank: !!existing.isBlank, isNew: false };
  return null;
}

function extractWord(board, placementMap, row, col, axis) {
  const [backRow, backCol] = axis === "horizontal" ? [0, -1] : [-1, 0];
  let startRow = row;
  let startCol = col;
  while (getCell(board, placementMap, startRow + backRow, startCol + backCol)) {
    startRow += backRow;
    startCol += backCol;
  }

  const [fwdRow, fwdCol] = axis === "horizontal" ? [0, 1] : [1, 0];
  const cells = [];
  let r = startRow;
  let c = startCol;
  let cell;
  while ((cell = getCell(board, placementMap, r, c))) {
    cells.push(cell);
    r += fwdRow;
    c += fwdCol;
  }
  return cells;
}

function scoreWord(cells, placementMap) {
  let wordMultiplier = 1;
  let total = 0;

  for (const cell of cells) {
    const value = cell.isBlank ? 0 : LETTER_VALUES[cell.letter.toUpperCase()] || 0;

    if (!placementMap.has(cellKey(cell.row, cell.col))) {
      total += value;
      continue;
    }

    const bonus = getBonus(cell.row, cell.col);
    if (bonus === "DL") total += value * 2;
    else if (bonus === "TL") total += value * 3;
    else total += value;

    if (bonus === "DW") wordMultiplier *= 2;
    else if (bonus === "TW") wordMultiplier *= 3;
  }

  return total * wordMultiplier;
}

export function validateMove(board, placements) {
  if (!Array.isArray(placements) || placements.length === 0) {
    return { accepted: false, reason: "Aucune tuile posée." };
  }

  const placementMap = buildPlacementMap(placements);
  if (placementMap.size !== placements.length) {
    return { accepted: false, reason: "Deux tuiles ne peuvent pas occuper la même case." };
  }

  for (const p of placements) {
    if (p.row < 0 || p.row >= BOARD_SIZE || p.col < 0 || p.col >= BOARD_SIZE) {
      return { accepted: false, reason: "Case hors du plateau." };
    }
    if (board[p.row][p.col]) {
      return { accepted: false, reason: "Une case choisie est déjà occupée." };
    }
  }

  const rows = new Set(placements.map((p) => p.row));
  const cols = new Set(placements.map((p) => p.col));

  let axis;
  if (placements.length === 1) {
    const { row, col } = placements[0];
    const hasHorizontalNeighbor =
      getCell(board, placementMap, row, col - 1) || getCell(board, placementMap, row, col + 1);
    const hasVerticalNeighbor =
      getCell(board, placementMap, row - 1, col) || getCell(board, placementMap, row + 1, col);
    axis = hasHorizontalNeighbor ? "horizontal" : hasVerticalNeighbor ? "vertical" : null;
  } else if (rows.size === 1) {
    axis = "horizontal";
  } else if (cols.size === 1) {
    axis = "vertical";
  } else {
    return { accepted: false, reason: "Les tuiles doivent être alignées sur une seule ligne ou colonne." };
  }

  const isFirstMove = board.every((row) => row.every((c) => !c));

  if (isFirstMove && placements.length < 2) {
    return { accepted: false, reason: "Le premier mot doit contenir au moins 2 lettres." };
  }

  if (axis) {
    const [line, fixed] = axis === "horizontal" ? [[...cols], placements[0].row] : [[...rows], placements[0].col];
    line.sort((a, b) => a - b);
    for (let i = line[0]; i <= line[line.length - 1]; i++) {
      const cell = axis === "horizontal" ? getCell(board, placementMap, fixed, i) : getCell(board, placementMap, i, fixed);
      if (!cell) {
        return { accepted: false, reason: "Les tuiles posées doivent former une ligne continue, sans case vide." };
      }
    }
  }

  if (isFirstMove) {
    const coversCenter = placements.some((p) => p.row === CENTER.row && p.col === CENTER.col);
    if (!coversCenter) {
      return { accepted: false, reason: "Le premier mot doit passer par la case centrale." };
    }
  } else {
    const touchesExisting = placements.some((p) =>
      [
        [p.row - 1, p.col],
        [p.row + 1, p.col],
        [p.row, p.col - 1],
        [p.row, p.col + 1],
      ].some(([r, c]) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c])
    );

    if (!touchesExisting) {
      return { accepted: false, reason: "Le mot doit se connecter à un mot déjà présent sur le plateau." };
    }
  }

  const wordsFound = [];
  const seen = new Set();

  function addWordIfNew(cells) {
    if (cells.length < 2) return;
    const key = cells.map((c) => cellKey(c.row, c.col)).join("|");
    if (seen.has(key)) return;
    seen.add(key);
    wordsFound.push(cells);
  }

  if (axis) {
    addWordIfNew(extractWord(board, placementMap, placements[0].row, placements[0].col, axis));
  }

  for (const p of placements) {
    const perpAxis = axis === "horizontal" ? "vertical" : "horizontal";
    addWordIfNew(extractWord(board, placementMap, p.row, p.col, perpAxis));
  }

  if (wordsFound.length === 0) {
    return { accepted: false, reason: "Aucun mot formé." };
  }

  const invalidWords = [];
  for (const cells of wordsFound) {
    const word = cells.map((c) => c.letter).join("");
    if (!isValidWord(word)) invalidWords.push(word);
  }
  if (invalidWords.length > 0) {
    return { accepted: false, reason: `Mot(s) invalide(s) : ${invalidWords.join(", ")}` };
  }

  let score = wordsFound.reduce((sum, cells) => sum + scoreWord(cells, placementMap), 0);
  const isBingo = placements.length === 7;
  if (isBingo) score += 50;

  return {
    accepted: true,
    words: wordsFound.map((cells) => cells.map((c) => c.letter).join("")),
    score,
    isBingo,
  };
}
