/** computes the valid moves for the selected piece */
import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
} from "..//constants.js";
import { canMoveQueen } from "./canMoveQueen.js";

export function canMove(board, selected, player, captureOnly = false) {
  if (selected == null) return new Set();

  const piece = board[selected];

  // if the piece is a queen, use queen movement rules
  if (
    (player === "dark" && piece === "queenDark") ||
    (player === "light" && piece === "queenLight")
  ) {
    return canMoveQueen(board, selected, player, captureOnly);
  }

  // regular piece movement rules
  if (piece !== player) return new Set();

  const [row, col] = getRowColByIndex(selected);
  const rowStep = player === "dark" ? +1 : -1;

  const steps = []; // regular moves (only forward)
  const jumps = []; // jumps (in all directions)

  // ----- regular steps: only forward -----
  for (const colStep of [-1, +1]) {
    const nRow = row + rowStep;
    const nCol = col + colStep;
    if (nRow >= 0 && nRow < BOARD_SIZE && nCol >= 0 && nCol < BOARD_SIZE) {
      const i = getIndexByRowCol(nRow, nCol);
      if (board[i] == null) steps.push(i);
    }
  }

  // ----- jumps: in all four diagonals -----
  for (const dRow of [-1, +1]) {
    for (const dCol of [-1, +1]) {
      const rMid = row + dRow;
      const cMid = col + dCol;
      const rDst = row + 2 * dRow;
      const cDst = col + 2 * dCol;

      if (
        rMid < 0 ||
        rMid >= BOARD_SIZE ||
        cMid < 0 ||
        cMid >= BOARD_SIZE ||
        rDst < 0 ||
        rDst >= BOARD_SIZE ||
        cDst < 0 ||
        cDst >= BOARD_SIZE
      )
        continue;

      const mid = board[getIndexByRowCol(rMid, cMid)];
      const dst = board[getIndexByRowCol(rDst, cDst)];

      if (mid && !mid.includes(player) && dst == null) {
        jumps.push(getIndexByRowCol(rDst, cDst));
      }
    }
  }

  // if we are in "capture only" mode (continuing a chain) — return only jumps
  // otherwise jumps take precedence over regular steps
  const result = captureOnly ? jumps : jumps.length ? jumps : steps;
  return new Set(result);
}
