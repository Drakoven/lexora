import { WORDS } from "./dictionary.js";

export function buildTrie(words) {
  const root = { children: {}, isWord: false };

  for (const word of words) {
    let node = root;
    for (const letter of word) {
      node = node.children[letter] || (node.children[letter] = { children: {}, isWord: false });
    }
    node.isWord = true;
  }

  return root;
}

let cachedTrie = null;

export function getTrie() {
  if (!cachedTrie) cachedTrie = buildTrie(WORDS);
  return cachedTrie;
}
