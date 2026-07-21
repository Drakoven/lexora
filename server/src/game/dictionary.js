import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wordsPath = join(__dirname, "..", "data", "dictionary", "words.txt");

// .trim() (pas juste .filter(Boolean)) : le runner de déploiement Windows
// peut checkout ce fichier avec des fins de ligne CRLF (core.autocrlf), ce
// qui laissait un "\r" traînant à la fin de chaque mot et cassait TOUTE la
// validation du dictionnaire en production (ex: "DO", "MODES" rejetés alors
// que valides). Voir aussi .gitattributes qui fixe les fins de ligne en LF
// pour empêcher la récidive.
export const WORDS = readFileSync(wordsPath, "utf-8")
  .split("\n")
  .map((w) => w.trim())
  .filter(Boolean);

const words = new Set(WORDS);

export function isValidWord(word) {
  return words.has(word.toUpperCase());
}
