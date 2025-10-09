import { BOARD_SIZE } from "../constants.js";

/** promotes a piece to a queen if it reached the opposite side of the board */

export function maybePromoteToQueen(piece, row) {
  if (piece === "dark" && row === BOARD_SIZE - 1) return "queenDark";
  if (piece === "light" && row === 0) return "queenLight";
  return piece;
}
