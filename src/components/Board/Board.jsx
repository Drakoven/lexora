import "./Board.css";
import { BOARD_SIZE, getBonus, CENTER } from "../../game/board.js";
import { playCellClickSound } from "../../audio/sounds.js";

const BONUS_LABELS = { TW: "MOT ×3", DW: "MOT ×2", TL: "LETTRE ×3", DL: "LETTRE ×2" };

function Board({ board, placements, onCellClick }) {
  const placementAt = (row, col) => placements.find((p) => p.row === row && p.col === col);

  return (
    <div className="board-scroll">
      <div className="board-grid">
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const committed = board[row][col];
            const pending = placementAt(row, col);
            const bonus = getBonus(row, col);
            const isCenter = row === CENTER.row && col === CENTER.col;

            let className = "board-cell";
            if (bonus) className += ` bonus-${bonus}`;
            if (isCenter) className += " is-center";
            if (committed) className += " is-committed";
            if (pending) className += " is-pending";

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                className={className}
                onClick={() => {
                  playCellClickSound();
                  onCellClick(row, col);
                }}
              >
                {committed && (committed.isBlank ? committed.letter?.toLowerCase() : committed.letter)}
                {!committed && pending && (pending.isBlank ? pending.letter?.toLowerCase() : pending.letter)}
                {!committed && !pending && bonus && (
                  <span className="board-cell-bonus-label">{BONUS_LABELS[bonus]}</span>
                )}
                {!committed && !pending && !bonus && isCenter && (
                  <span className="board-cell-star">★</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Board;
