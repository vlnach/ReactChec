export const BOARD_SIZE = 8; // размер доски 8x8

// вспомогательные функции
/** индекс в массиве по координатам */
export const getIndexByRowCol = (row, col) => row * BOARD_SIZE + col;

/** координаты по индексу в массиве */
export const getRowColByIndex = (i) => [
  Math.floor(i / BOARD_SIZE),
  i % BOARD_SIZE,
];

/** черная клетка = могут стоять шашки, на белой нельзя */
export const isDarkCell = (row, col) => (row + col) % 2 === 1;
