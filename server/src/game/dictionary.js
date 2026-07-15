import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wordsPath = join(__dirname, "..", "data", "dictionary", "words.txt");

const words = new Set(readFileSync(wordsPath, "utf-8").split("\n").filter(Boolean));

export function isValidWord(word) {
  return words.has(word.toUpperCase());
}
