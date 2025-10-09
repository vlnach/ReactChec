import { Square } from "./square.js";
import { BOARD_SIZE, getIndexByRowCol, isDarkCell } from "../constants.js";

export function Board({ squares, selected, validMoves, onSelect, onMove }) {
  return (
    <>
      {[...Array(BOARD_SIZE)].map((_, row) => (
        <div className="board-row" key={row}>
          {[...Array(BOARD_SIZE)].map((_, col) => {
            const index = getIndexByRowCol(row, col); // index of 1D array
            return (
              <Square
                key={index}
                value={squares[index]}
                dark={isDarkCell(row, col)}
                selected={index === selected}
                hint={validMoves.has(index)}
                onSquareClick={() =>
                  squares[index] ? onSelect(index) : onMove(index)
                }
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
