const cache = new Map();
const MAX_CACHE_SIZE = 2000;
const MAX_DEFINITIONS = 3;

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(str) {
  return str.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase();
}

function extractFrenchSection(wikitext) {
  const startMatch = wikitext.match(/==\s*\{\{langue\|fr\}\}\s*==/);
  if (!startMatch) return null;
  const start = startMatch.index + startMatch[0].length;
  const rest = wikitext.slice(start);
  const nextLangMatch = rest.match(/\n==\s*\{\{langue\|/);
  return nextLangMatch ? rest.slice(0, nextLangMatch.index) : rest;
}

// Nettoyage volontairement pragmatique du wikitext (liens, gras/italique,
// références, templates de glose) — ne gère pas toutes les templates
// exotiques de Wiktionary, mais couvre largement assez bien pour une
// fonctionnalité de confort, pas un mécanisme central du jeu.
function cleanWikitext(text) {
  return text
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[^>]*>.*?<\/ref>/gs, "")
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2")
    .replace(/\[\[([^\]]*)\]\]/g, "$1")
    .replace(/'''([^']*)'''/g, "$1")
    .replace(/''([^']*)''/g, "$1")
    .replace(/\{\{([^{}]*)\}\}/g, (match, inner) => {
      const parts = inner.split("|").map((p) => p.trim());
      const name = parts[0];
      const args = parts.slice(1).filter((p) => !/^(fr|lang=fr|\d+)$/.test(p));
      if (args.length === 0) return name ? `(${name})` : "";
      return args[args.length - 1];
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDefinitions(wikitext) {
  const frSection = extractFrenchSection(wikitext);
  if (!frSection) return [];

  const defs = [];
  for (const line of frSection.split("\n")) {
    if (/^#\s+[^*:]/.test(line)) {
      const cleaned = cleanWikitext(line.replace(/^#\s*/, ""));
      if (cleaned) defs.push(cleaned);
    }
    if (defs.length >= MAX_DEFINITIONS) break;
  }
  return defs;
}

// La première classe grammaticale ("nom", "adjectif", "verbe"...) de la
// section française, via son marqueur {{S|classe|fr...}}. Sert uniquement à
// départager une ambiguïté d'accents (ex. "zebre" retiré de ses accents
// correspond à la fois à "zèbre" le nom et "zébré" l'adjectif) — un nom est
// presque toujours ce qu'un joueur cherche à comprendre plutôt qu'une forme
// fléchie ou un adjectif.
function getPrimaryPartOfSpeech(wikitext) {
  const frSection = extractFrenchSection(wikitext);
  if (!frSection) return null;
  const match = frSection.match(/\{\{S\|([a-zéèêà-]+)\|fr/);
  return match ? match[1] : null;
}

async function fetchWikitext(title) {
  const url = `https://fr.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(
    title
  )}&prop=wikitext&format=json&formatversion=2`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.parse?.wikitext ?? null;
}

async function searchCandidateTitles(word) {
  const url = `https://fr.wiktionary.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    word
  )}&srlimit=5&format=json&formatversion=2`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.query?.search ?? []).map((r) => r.title);
}

async function lookup(word) {
  const lower = word.toLowerCase();

  // Cas direct (sans ambiguïté, le titre est exact) : pas besoin de comparer
  // à d'autres candidats, on retourne dès que trouvé.
  const directWikitext = await fetchWikitext(lower);
  if (directWikitext) {
    const defs = extractDefinitions(directWikitext);
    if (defs.length > 0) return defs;
  }

  // Les tuiles Scrabble n'ont pas d'accents (voir game/dictionary.js), donc
  // un mot posé comme "ZEBRE" ne correspond à aucune page directe sur
  // Wiktionary, dont les titres sont accentués ("zèbre"). On cherche parmi
  // les résultats de recherche les titres qui correspondent une fois les
  // accents retirés — plusieurs mots réels distincts (ex. "zèbre" le nom vs
  // "zébré" l'adjectif) peuvent partager la même forme sans accent, d'où la
  // collecte de tous les candidats (plutôt que de s'arrêter au premier
  // trouvé) pour pouvoir ensuite préférer un nom.
  const normalizedTarget = normalize(lower);
  const candidates = await searchCandidateTitles(lower);
  const matches = [];
  for (const title of candidates) {
    if (title.toLowerCase() === lower) continue; // déjà essayé ci-dessus
    if (normalize(title) !== normalizedTarget) continue;
    const wikitext = await fetchWikitext(title);
    if (!wikitext) continue;
    const defs = extractDefinitions(wikitext);
    if (defs.length > 0) matches.push({ defs, pos: getPrimaryPartOfSpeech(wikitext) });
  }

  if (matches.length === 0) return [];
  const noun = matches.find((m) => m.pos === "nom");
  return (noun ?? matches[0]).defs;
}

export async function getDefinitions(word) {
  const key = word.toUpperCase();
  if (cache.has(key)) return cache.get(key);

  const result = await lookup(word);

  if (cache.size >= MAX_CACHE_SIZE) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, result);
  return result;
}
