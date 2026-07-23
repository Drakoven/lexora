export function canAfford(rack, tiles) {
  const letterCounts = {};
  let blankCount = 0;
  for (const tile of rack) {
    if (tile.isBlank) blankCount++;
    else letterCounts[tile.letter] = (letterCounts[tile.letter] || 0) + 1;
  }
  for (const tile of tiles) {
    if (tile.isBlank) {
      if (blankCount <= 0) return false;
      blankCount--;
    } else {
      if (!letterCounts[tile.letter]) return false;
      letterCounts[tile.letter]--;
    }
  }
  return true;
}
