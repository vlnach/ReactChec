import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
} from "../constants.js";

/** computes the valid moves for a queen piece */

export function canMoveQueen(board, selected, player, captureOnly = false) {
  const [row, col] = getRowColByIndex(selected);
  const moves = [];

  for (const rStep of [-1, +1]) {
    for (const cStep of [-1, +1]) {
      let r = row + rStep;
      let c = col + cStep;
      let jumped = false;

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        const idx = getIndexByRowCol(r, c);
        const cell = board[idx];

        if (cell == null) {
          if (!captureOnly || jumped) {
            moves.push(idx);
            if (jumped) break;
          }
        } else {
          if (!isMyPiece(player, cell) && !jumped) {
            jumped = true;
          } else {
            break;
          }
        }

        r += rStep;
        c += cStep;
      }
    }
  }

  return new Set(moves);
}
