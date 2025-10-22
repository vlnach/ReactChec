import { getRowColByIndex, getIndexByRowCol } from "../constants.js";
import { maybePromoteToQueen } from "./maybePromote.js";

/**
 * Applies a move on a fresh copy of the board and returns the new board array.
 * For a queen: if the move is a diagonal jump over an opponent, removes the first encountered piece.
 * For a regular checker: standard two-cell jump removes the middle piece.
 */
export function makeMove(boardCells, fromIndex, toIndex) {
  const nextBoard = boardCells.slice();

  const [fromRow, fromCol] = getRowColByIndex(fromIndex);
  const [toRow, toCol] = getRowColByIndex(toIndex);

  const deltaRow = toRow - fromRow;
  const deltaCol = toCol - fromCol;
  const absRow = Math.abs(deltaRow);
  const absCol = Math.abs(deltaCol);

  // Remove a captured piece (queen “slides”, regular piece jumps two cells)
  if (absRow === absCol && absRow > 1) {
    // Queen case: walk the diagonal from `from` to `to` and remove the first encountered piece
    const stepRow = Math.sign(deltaRow);
    const stepCol = Math.sign(deltaCol);

    let walkRow = fromRow + stepRow;
    let walkCol = fromCol + stepCol;

    while (walkRow !== toRow && walkCol !== toCol) {
      const walkIndex = getIndexByRowCol(walkRow, walkCol);
      if (nextBoard[walkIndex] != null) {
        nextBoard[walkIndex] = null; // remove the captured piece
        break; // according to current rules — only one captured piece per move
      }
      walkRow += stepRow;
      walkCol += stepCol;
    }
  } else if (absRow === 2 && absCol === 2) {
    // Regular checker: two-cell jump over the middle piece
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    nextBoard[getIndexByRowCol(midRow, midCol)] = null;
  }

  // Move the piece
  nextBoard[toIndex] = nextBoard[fromIndex];
  nextBoard[fromIndex] = null;

  // Optional promotion to queen
  nextBoard[toIndex] = maybePromoteToQueen(nextBoard[toIndex], toRow);

  return nextBoard;
}
