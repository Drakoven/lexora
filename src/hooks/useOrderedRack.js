import { useState } from "react";

let nextTileKey = 1;

function reconcile(prevOrdered, rawTiles) {
  const remaining = [...rawTiles];
  const kept = [];

  for (const entry of prevOrdered) {
    const idx = remaining.findIndex(
      (t) => t.letter === entry.letter && !!t.isBlank === !!entry.isBlank
    );
    if (idx !== -1) {
      kept.push(entry);
      remaining.splice(idx, 1);
    }
  }

  const added = remaining.map(({ letter, isBlank }) => ({ letter, isBlank, id: nextTileKey++ }));
  return [...kept, ...added];
}

// Le chevalet en ligne est re-téléchargé depuis le serveur à chaque
// rafraîchissement (socket, refetch), sans identité stable par tuile. Ce hook
// réconcilie les nouvelles tuiles reçues avec l'ordre précédent (par
// lettre/joker) pour que l'ordre choisi par le joueur survive aux
// rafraîchissements qui ne changent pas réellement le contenu du chevalet.
export function useOrderedRack(rawTiles) {
  const [ordered, setOrdered] = useState(() => reconcile([], rawTiles));
  const [prevRawTiles, setPrevRawTiles] = useState(rawTiles);

  if (rawTiles !== prevRawTiles) {
    setPrevRawTiles(rawTiles);
    setOrdered(reconcile(ordered, rawTiles));
  }

  function swapTiles(idA, idB) {
    setOrdered((prev) => {
      const next = [...prev];
      const i = next.findIndex((t) => t.id === idA);
      const j = next.findIndex((t) => t.id === idB);
      if (i === -1 || j === -1) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function reorderTiles(newIdOrder) {
    setOrdered((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      const next = newIdOrder.map((id) => byId.get(id)).filter(Boolean);
      return next.length === prev.length ? next : prev;
    });
  }

  return [ordered, swapTiles, reorderTiles];
}
