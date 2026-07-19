import "./Rack.css";
import { LETTER_VALUES } from "../../game/letters.js";
import { playTileClickSound } from "../../audio/sounds.js";

function Rack({ tiles, selectedTileId, exchangeSelection, mode, onTileClick }) {
  return (
    <div className="rack">
      {tiles.map((tile) => {
        const isSelected = mode === "place" ? tile.id === selectedTileId : exchangeSelection.has(tile.id);

        const label = tile.isBlank
          ? `Joker${isSelected ? ", sélectionné" : ""}`
          : `Lettre ${tile.letter}, ${LETTER_VALUES[tile.letter]} point${LETTER_VALUES[tile.letter] > 1 ? "s" : ""}${isSelected ? ", sélectionnée" : ""}`;

        return (
          <button
            key={tile.id}
            type="button"
            className={isSelected ? "rack-tile is-selected" : "rack-tile"}
            aria-pressed={isSelected}
            aria-label={label}
            onClick={() => {
              playTileClickSound();
              onTileClick(tile.id);
            }}
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
