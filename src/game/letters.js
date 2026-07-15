export const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 10, L: 1, M: 2, N: 1, O: 1, P: 3, Q: 8, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 10, X: 10, Y: 10, Z: 10,
};

export const LETTER_COUNTS = {
  A: 9, B: 2, C: 2, D: 3, E: 15, F: 2, G: 2, H: 2, I: 8, J: 1,
  K: 1, L: 5, M: 3, N: 6, O: 6, P: 2, Q: 1, R: 6, S: 6, T: 6,
  U: 6, V: 2, W: 1, X: 1, Y: 1, Z: 1,
};

export const BLANK_COUNT = 2;
export const BOARD_SIZE = 15;
export const RACK_SIZE = 7;

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createBag() {
  const tiles = [];
  for (const [letter, count] of Object.entries(LETTER_COUNTS)) {
    for (let i = 0; i < count; i++) tiles.push({ letter, isBlank: false });
  }
  for (let i = 0; i < BLANK_COUNT; i++) tiles.push({ letter: null, isBlank: true });
  return shuffle(tiles);
}

export function drawTiles(bag, count) {
  const drawn = bag.slice(0, count);
  const remaining = bag.slice(count);
  return { drawn, remaining };
}
