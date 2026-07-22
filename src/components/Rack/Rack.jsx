import { useRef, useState } from "react";
import "./Rack.css";
import { LETTER_VALUES } from "../../game/letters.js";
import { playTileClickSound } from "../../audio/sounds.js";

const DRAG_THRESHOLD_PX = 6;

function Rack({ tiles, selectedTileId, exchangeSelection, mode, onTileClick, onReorder }) {
  // Bookkeeping pur pour les gestionnaires d'événements (jamais lu pendant le
  // rendu) : quelle tuile est sous le pointeur, position de départ, et si le
  // seuil de déplacement a été franchi.
  const dragRef = useRef({ tileId: null, startX: 0, startY: 0, dragging: false, pointerId: null });
  // État React séparé, mis à jour uniquement quand un vrai glisser démarre —
  // c'est la seule source consultée pendant le rendu pour l'effet visuel.
  const [draggingTileId, setDraggingTileId] = useState(null);

  function handlePointerDown(e, tileId) {
    if (mode !== "reorder" || !onReorder) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { tileId, startX: e.clientX, startY: e.clientY, dragging: false, pointerId: e.pointerId };
  }

  function handlePointerMove(e) {
    const drag = dragRef.current;
    if (drag.tileId === null) return;

    if (!drag.dragging) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      drag.dragging = true;
      setDraggingTileId(drag.tileId);
    }

    const overTile = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-tile-id]");
    if (!overTile) return;
    const overId = Number(overTile.dataset.tileId);
    if (overId === drag.tileId) return;

    const fromIndex = tiles.findIndex((t) => t.id === drag.tileId);
    const toIndex = tiles.findIndex((t) => t.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;

    const order = tiles.map((t) => t.id);
    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, drag.tileId);
    onReorder(order);
  }

  function handlePointerUp(e) {
    if (dragRef.current.pointerId !== null) {
      try {
        e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
      } catch {
        // le pointeur peut déjà avoir été relâché (pointercancel) — sans conséquence
      }
    }
    dragRef.current.tileId = null;
    setDraggingTileId(null);
  }

  function handleClick(tileId) {
    // Après un vrai glisser (dragging passé à true), le navigateur émet quand
    // même un click juste après le pointerup — on l'avale ici pour ne pas
    // déclencher en plus la sélection clique-clique. dragRef.current.dragging
    // n'est réinitialisé qu'ici (pas dans pointerUp) pour rester lisible par
    // ce click qui suit juste après.
    if (dragRef.current.dragging) {
      dragRef.current.dragging = false;
      return;
    }
    playTileClickSound();
    onTileClick(tileId);
  }

  return (
    <div className="rack">
      {tiles.map((tile) => {
        const isSelected = mode === "exchange" ? exchangeSelection.has(tile.id) : tile.id === selectedTileId;
        const isDragging = tile.id === draggingTileId;

        const label = tile.isBlank
          ? `Joker${isSelected ? ", sélectionné" : ""}`
          : `Lettre ${tile.letter}, ${LETTER_VALUES[tile.letter]} point${LETTER_VALUES[tile.letter] > 1 ? "s" : ""}${isSelected ? ", sélectionnée" : ""}`;

        let className = "rack-tile";
        if (isSelected) className += " is-selected";
        if (isDragging) className += " is-dragging";

        return (
          <button
            key={tile.id}
            type="button"
            data-tile-id={tile.id}
            className={className}
            style={mode === "reorder" ? { touchAction: "none" } : undefined}
            aria-pressed={isSelected}
            aria-label={label}
            onPointerDown={(e) => handlePointerDown(e, tile.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={() => handleClick(tile.id)}
          >
            <span className="rack-tile-letter" aria-hidden="true">{tile.isBlank ? "" : tile.letter}</span>
            {!tile.isBlank && <span className="rack-tile-value" aria-hidden="true">{LETTER_VALUES[tile.letter]}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Rack;
