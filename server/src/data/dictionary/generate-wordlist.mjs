// Regénère words.txt à partir de fr.dic/fr.aff (Dicollecte, MPL 2.0).
// Usage : node src/data/dictionary/generate-wordlist.mjs (depuis server/,
// nécessite la devDependency "hunspell-reader" : npm install).
//
// Les tuiles de Scrabble n'ont pas d'accents ni de ligatures (œ/æ), donc
// chaque mot est normalisé : œ→oe, æ→ae, puis accents retirés (NFD).
import { HunspellReader } from "hunspell-reader";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const reader = await HunspellReader.createFromFiles(
  join(__dirname, "fr.aff"),
  join(__dirname, "fr.dic")
);

const validPattern = /^[a-zàâäéèêëïîôöùûüçœæ]+$/;
const words = new Set();

for (const word of reader.iterateWords()) {
  if (!validPattern.test(word)) continue;
  const normalized = word
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
  if (normalized.length < 2 || normalized.length > 15) continue;
  words.add(normalized);
}

const sorted = [...words].sort();
writeFileSync(join(__dirname, "words.txt"), sorted.join("\n") + "\n");
console.log("unique normalized words:", sorted.length);
