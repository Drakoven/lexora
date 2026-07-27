// Regénère words.txt à partir de fr.dic/fr.aff (Dicollecte, MPL 2.0).
// Usage : node src/data/dictionary/generate-wordlist.mjs (depuis server/,
// nécessite la devDependency "hunspell-reader" : npm install).
//
// Les tuiles de Scrabble n'ont pas d'accents ni de ligatures (œ/æ), donc
// chaque mot est normalisé : œ→oe, æ→ae, puis accents retirés (NFD).
import { HunspellReader } from "hunspell-reader";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// fr.dic contient des entrées taguées po:pfx/po:sfx (fragments de
// composition comme "franco-", ou "fr"/"com"/"org" qui ne sont que le
// suffixe interne des noms de domaine .fr/.com/.org) et po:err (formes
// élidées internes comme "qu'", "jusqu'"). Ce ne sont pas des mots jouables,
// mais rien dans le format .dic ne les distingue autrement qu'via ce tag
// morphologique — sans ce filtre, hunspell-reader les développe en faux
// mots comme FR, COM, ORG, QU, JUSQU (signalé par un joueur : le bot posait
// "fr").
const dicPath = join(__dirname, "fr.dic");
const dicLines = readFileSync(dicPath, "utf-8").split("\n");
const excludedTags = /\bpo:(pfx|sfx|err)\b/;
const filteredEntries = dicLines
  .slice(1)
  .filter((line) => line && !excludedTags.test(line))
  // fr.aff's PFX U. rule prepends SI magnitude prefixes (k, m, µ, M, G...)
  // to base unit symbols (s, m, g, cd, l, mol, rad...) to recognize things
  // like "km"/"kg" for spell-checking — but it mechanically generates
  // faux-mots like MS, PM, KM that aren't real Scrabble words (signalé par
  // un joueur : "MS" accepté par le bot). Stripping just the U. flag keeps
  // the base symbol itself (already a separate, pre-existing question)
  // while killing the prefix+unit cross product.
  .map((line) => line.replace(/^(\S+)\/U\.(\|\|--)/, "$1/$2"));
const filteredDicPath = join(__dirname, ".fr.filtered.dic");
writeFileSync(filteredDicPath, [String(filteredEntries.length), ...filteredEntries].join("\n") + "\n", "utf-8");

const reader = await HunspellReader.createFromFiles(
  join(__dirname, "fr.aff"),
  filteredDicPath
);
unlinkSync(filteredDicPath);

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
