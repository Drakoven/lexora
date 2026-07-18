import { getTrie } from "./trie.js";
import { validateMove } from "./scoring.js";
import { BOARD_SIZE } from "./letters.js";
import { CENTER } from "./board.js";

function transpose(board) {
  const result = [];
  for (let c = 0; c < BOARD_SIZE; c++) {
    const row = [];
    for (let r = 0; r < BOARD_SIZE; r++) row.push(board[r][c]);
    result.push(row);
  }
  return result;
}

function isBoardEmpty(board) {
  return board.every((row) => row.every((cell) => !cell));
}

function findAnchors(board) {
  if (isBoardEmpty(board)) return [{ row: CENTER.row, col: CENTER.col }];

  const anchors = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) continue;
      const hasNeighbor =
        (r > 0 && board[r - 1][c]) ||
        (r < BOARD_SIZE - 1 && board[r + 1][c]) ||
        (c > 0 && board[r][c - 1]) ||
        (c < BOARD_SIZE - 1 && board[r][c + 1]);
      if (hasNeighbor) anchors.push({ row: r, col: c });
    }
  }
  return anchors;
}

function buildRackMultiset(rack) {
  const counts = {};
  let blanks = 0;
  for (const tile of rack) {
    if (tile.isBlank) blanks++;
    else counts[tile.letter] = (counts[tile.letter] || 0) + 1;
  }
  return { counts, blanks };
}

function cloneMultiset(multiset) {
  return { counts: { ...multiset.counts }, blanks: multiset.blanks };
}

function totalTiles(multiset) {
  return Object.values(multiset.counts).reduce((sum, n) => sum + n, 0) + multiset.blanks;
}

// Nombre de cases vides consécutives juste avant l'ancre, bornée par le
// bord du plateau et par le nombre de tuiles disponibles.
function computeLimit(board, row, anchorCol, maxTiles) {
  let limit = 0;
  let col = anchorCol - 1;
  while (col >= 0 && !board[row][col] && limit < maxTiles) {
    limit++;
    col--;
  }
  return limit;
}

// Nœud du trie d'où démarrer le DFS à `startCol` : la racine si la case
// juste avant est vide/hors plateau, ou un nœud "amorcé" en redescendant
// le trie à travers le mot existant si cette case est occupée — sans ça,
// le générateur ne peut jamais prolonger un mot existant sans espace
// (ex. "CAT" -> "CATS").
function getSeedNode(board, row, startCol, trie) {
  const beforeCol = startCol - 1;
  if (beforeCol < 0 || !board[row][beforeCol]) return trie;

  let runStart = beforeCol;
  while (runStart - 1 >= 0 && board[row][runStart - 1]) runStart--;

  let node = trie;
  for (let col = runStart; col <= beforeCol; col++) {
    node = node.children[board[row][col].letter];
    if (!node) return null;
  }
  return node;
}

function checkWordEnd(node, cells, hasNew, row, col, board, toOriginal, validationBoard, candidates, seen) {
  if (!node.isWord || !hasNew) return;
  const nextCol = col + 1;
  if (nextCol < BOARD_SIZE && board[row][nextCol]) return; // forcé de continuer

  const newPlacements = cells.filter((c) => c.isNew).map((c) => {
    const { row: origRow, col: origCol } = toOriginal(c.row, c.col);
    return { row: origRow, col: origCol, letter: c.letter, isBlank: c.isBlank };
  });
  if (newPlacements.length === 0) return;

  const key = [...newPlacements]
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .map((p) => `${p.row},${p.col},${p.letter},${p.isBlank}`)
    .join("|");
  if (seen.has(key)) return;
  seen.add(key);

  const result = validateMove(validationBoard, newPlacements);
  if (result.accepted) {
    candidates.push({ placements: newPlacements, ...result });
  }
}

function dfs(board, row, col, node, rack, cellsSoFar, hasNew, toOriginal, validationBoard, candidates, seen) {
  if (col >= BOARD_SIZE) return;

  const existing = board[row][col];

  if (existing) {
    const child = node.children[existing.letter];
    if (!child) return;
    const cells = [...cellsSoFar, { row, col, letter: existing.letter, isBlank: existing.isBlank, isNew: false }];
    checkWordEnd(child, cells, hasNew, row, col, board, toOriginal, validationBoard, candidates, seen);
    dfs(board, row, col + 1, child, rack, cells, hasNew, toOriginal, validationBoard, candidates, seen);
    return;
  }

  for (const letter of Object.keys(rack.counts)) {
    if (rack.counts[letter] <= 0) continue;
    const child = node.children[letter];
    if (!child) continue;

    rack.counts[letter]--;
    const cells = [...cellsSoFar, { row, col, letter, isBlank: false, isNew: true }];
    checkWordEnd(child, cells, true, row, col, board, toOriginal, validationBoard, candidates, seen);
    dfs(board, row, col + 1, child, rack, cells, true, toOriginal, validationBoard, candidates, seen);
    rack.counts[letter]++;
  }

  if (rack.blanks > 0) {
    rack.blanks--;
    for (const letter of Object.keys(node.children)) {
      const child = node.children[letter];
      const cells = [...cellsSoFar, { row, col, letter, isBlank: true, isNew: true }];
      checkWordEnd(child, cells, true, row, col, board, toOriginal, validationBoard, candidates, seen);
      dfs(board, row, col + 1, child, rack, cells, true, toOriginal, validationBoard, candidates, seen);
    }
    rack.blanks++;
  }
}

function searchAxis(searchBoard, validationBoard, toOriginal, rack, trie, candidates, seen) {
  const baseMultiset = buildRackMultiset(rack);
  const anchors = findAnchors(searchBoard);

  for (const anchor of anchors) {
    const maxTiles = totalTiles(baseMultiset);
    const limit = computeLimit(searchBoard, anchor.row, anchor.col, maxTiles);

    for (let offset = 0; offset <= limit; offset++) {
      const startCol = anchor.col - offset;
      const seedNode = getSeedNode(searchBoard, anchor.row, startCol, trie);
      if (!seedNode) continue;

      const rackCopy = cloneMultiset(baseMultiset);
      dfs(searchBoard, anchor.row, startCol, seedNode, rackCopy, [], false, toOriginal, validationBoard, candidates, seen);
    }
  }
}

export function generateMoves(board, rack) {
  const trie = getTrie();
  const candidates = [];
  const seen = new Set();

  searchAxis(board, board, (row, col) => ({ row, col }), rack, trie, candidates, seen);
  searchAxis(transpose(board), board, (row, col) => ({ row: col, col: row }), rack, trie, candidates, seen);

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}
