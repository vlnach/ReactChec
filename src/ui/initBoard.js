import { BOARD_SIZE, getIndexByRowCol, isDarkCell } from "../constants.js";

//**  initialization of the board */

export function initBoard() {
  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  // black checkers
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isDarkCell(row, col)) board[getIndexByRowCol(row, col)] = "dark";
    }
  }
  // white checkers
  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isDarkCell(row, col)) board[getIndexByRowCol(row, col)] = "light";
    }
  }
  return board;
}
