import "./Rack.css";
import { LETTER_VALUES } from "../../game/letters.js";
import { playTileClickSound } from "../../audio/sounds.js";

function Rack({ tiles, selectedTileId, exchangeSelection, mode, onTileClick }) {
  return (
    <div className="rack">
      {tiles.map((tile) => {
        const isSelected = mode === "place" ? tile.id === selectedTileId : exchangeSelection.has(tile.id);

        return (
          <button
            key={tile.id}
            type="button"
            className={isSelected ? "rack-tile is-selected" : "rack-tile"}
            onClick={() => {
              playTileClickSound();
              onTileClick(tile.id);
            }}
          >
            <span className="rack-tile-letter">{tile.isBlank ? "" : tile.letter}</span>
            {!tile.isBlank && <span className="rack-tile-value">{LETTER_VALUES[tile.letter]}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Rack;
