import { getDefinitions } from "../dictionary/definitions.js";

export async function getWordDefinitions(req, res) {
  const { word } = req.params;

  if (!/^[A-Za-zÀ-ÿ-]{1,30}$/.test(word)) {
    return res.status(400).json({ message: "Mot invalide." });
  }

  const definitions = await getDefinitions(word);
  res.json({ word: word.toUpperCase(), definitions });
}
