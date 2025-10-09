export const BOARD_SIZE = 8; // 8x8 board
export const isMyPiece = (player, cell) =>
  (player === "dark" && (cell === "dark" || cell === "queenDark")) ||
  (player === "light" && (cell === "light" || cell === "queenLight"));

// helper functions
/** index in array by coordinates */
export const getIndexByRowCol = (row, col) => row * BOARD_SIZE + col;

/** coordinates by index in array */
export const getRowColByIndex = (i) => [
  Math.floor(i / BOARD_SIZE),
  i % BOARD_SIZE,
];

/** dark cell = can hold pieces, white cannot */
export const isDarkCell = (row, col) => (row + col) % 2 === 1;
