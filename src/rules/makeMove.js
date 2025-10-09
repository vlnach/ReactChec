import { getRowColByIndex, getIndexByRowCol } from "../constants.js";
import { maybePromoteToQueen } from "./maybePromote.js";
//** executes the move on the board, returns the new board state */

export function makeMove(board, fromIndex, toIndex) {
  const newBoard = board.slice();
  const [row1, col1] = getRowColByIndex(fromIndex);
  const [row2, col2] = getRowColByIndex(toIndex);

  const dRow = row2 - row1;
  const dCol = col2 - col1;
  const absR = Math.abs(dRow);
  const absC = Math.abs(dCol);

  // if it was a jump, remove the jumped piece
  if (absR === absC && absR > 1) {
    const stepR = dRow > 0 ? 1 : -1;
    const stepC = dCol > 0 ? 1 : -1;
    let r = row1 + stepR;
    let c = col1 + stepC;

    while (r !== row2 && c !== col2) {
      const idx = getIndexByRowCol(r, c);
      if (newBoard[idx] != null) {
        // found the jumped piece
        newBoard[idx] = null;
        break; // in Russian checkers, only one piece can be jumped at a time
      }
      r += stepR;
      c += stepC;
    }
  } else if (absR === 2 && absC === 2) {
    // simpler case: classic jump over one piece
    const midRow = (row1 + row2) / 2;
    const midCol = (col1 + col2) / 2;
    newBoard[getIndexByRowCol(midRow, midCol)] = null;
  }

  // move the piece
  newBoard[toIndex] = newBoard[fromIndex];
  newBoard[fromIndex] = null;

  // possible promotion to king
  newBoard[toIndex] = maybePromoteToQueen(newBoard[toIndex], row2);

  return newBoard;
}
