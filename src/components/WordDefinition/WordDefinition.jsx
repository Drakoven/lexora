import { useState } from "react";
import "./WordDefinition.css";
import * as dictionaryApi from "../../api/dictionary.js";

// Bouton "?" à côté d'un mot posé, chargeant sa définition à la demande
// (jamais préchargée pour tous les mots d'une partie — évite de spammer
// Wiktionary pour des mots que personne ne consulte).
function WordDefinition({ word }) {
  const [state, setState] = useState("closed"); // closed | loading | open | error
  const [definitions, setDefinitions] = useState([]);

  async function handleToggle() {
    if (state === "open" || state === "loading") {
      setState("closed");
      return;
    }

    setState("loading");
    try {
      const result = await dictionaryApi.getDefinitions(word);
      setDefinitions(result.definitions);
      setState("open");
    } catch {
      setState("error");
    }
  }

  return (
    <span className="word-definition">
      <button
        type="button"
        className="word-definition-toggle"
        onClick={handleToggle}
        aria-expanded={state === "open"}
        aria-label={`Définition de ${word}`}
        disabled={state === "loading"}
      >
        {word} {state === "loading" ? "…" : "📖"}
      </button>
      {state === "open" && definitions.length === 0 && (
        <span className="word-definition-panel word-definition-empty">Définition introuvable.</span>
      )}
      {state === "open" && definitions.length > 0 && (
        <ul className="word-definition-panel">
          {definitions.map((def, i) => (
            <li key={i}>{def}</li>
          ))}
        </ul>
      )}
      {state === "error" && (
        <span className="word-definition-panel word-definition-empty">
          Définition indisponible pour le moment.
        </span>
      )}
    </span>
  );
}

export default WordDefinition;
