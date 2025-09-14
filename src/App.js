import { useState } from "react";

const BOARD_SIZE = 8; // размер доски 8x8

// вспомогательные функции
/** индекс в массиве по координатам */
const getIndexByRowCol = (row, col) => row * BOARD_SIZE + col;

/** координаты по индексу в массиве */
const getRowColByIndex = (i) => [Math.floor(i / BOARD_SIZE), i % BOARD_SIZE];

/** черная клетка = могут стоять шашки, на белой нельзя */
const isDarkCell = (row, col) => (row + col) % 2 === 1;

// компоненты

function Square({ value, onSquareClick, dark, selected, hint }) {
  let className = "square";
  if (dark) className += " square--dark";
  if (selected) className += " square--selected";
  if (hint) className += " square--hint";

  return (
    <button className={className} onClick={onSquareClick}>
      {value === "dark" ? "●" : value === "light" ? "○" : ""}
    </button>
  );
}

// вся доска
function Board({ squares, selected, validMoves, onSelect, onMove }) {
  return (
    <>
      {[...Array(BOARD_SIZE)].map((_, row) => (
        <div className="board-row" key={row}>
          {[...Array(BOARD_SIZE)].map((_, col) => {
            const index = getIndexByRowCol(row, col); // индекс клетки в массиве
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

export default function Game() {
  const [history, setHistory] = useState([initBoard()]);
  const [selected, setSelected] = useState(null);

  const currentMove = history.length - 1;
  const squares = history[currentMove];
  const darkIsNext = currentMove % 2 === 0;
  const player = darkIsNext ? "dark" : "light";

  const validMoves = canMove(squares, selected, player);

  // клик по своей шашке - выделяем или снимаем выделение
  function handleSelect(i) {
    if (squares[i] === player) {
      setSelected(i);
    } else {
      setSelected(null);
    }
  }

  // клик по пустой клетке - если ход возможен, то делаем его
  function handleMove(i) {
    if (selected != null && validMoves.has(i)) {
      const next = squares.slice();
      const [row1, col1] = getRowColByIndex(selected);
      const [row2, col2] = getRowColByIndex(i);

      // если прыжок на 2 клетки → убираем шашку соперника
      if (Math.abs(row2 - row1) === 2 && Math.abs(col2 - col1) === 2) {
        const midRow = (row1 + row2) / 2;
        const midCol = (col1 + col2) / 2;
        next[getIndexByRowCol(midRow, midCol)] = null;
      }

      next[i] = squares[selected];
      next[selected] = null;
      const nextHistory = [...history.slice(0, currentMove + 1), next];
      setHistory(nextHistory);
      setSelected(null);
    }
  }

  return (
    <div className="game">
      <div className="game-board">
        <div className="status">Turn: {player}</div>
        <Board
          squares={squares}
          selected={selected}
          validMoves={validMoves}
          onSelect={handleSelect}
          onMove={handleMove}
        />
      </div>
    </div>
  );
}

// инициализация доски, расстановка шашек
function initBoard() {
  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  // расставляем темные шашки
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isDarkCell(row, col)) board[getIndexByRowCol(row, col)] = "dark";
    }
  }
  // расставляем светлые шашки
  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isDarkCell(row, col)) board[getIndexByRowCol(row, col)] = "light";
    }
  }
  return board;
}

/** вычисление допустимых ходов для выделенной шашки */
function canMove(board, selected, player) {
  if (selected == null || board[selected] !== player) return new Set();

  const [row, col] = getRowColByIndex(selected);
  const rowStep = player === "dark" ? +1 : -1;
  const moves = [];

  for (const colStep of [-1, +1]) {
    const nextRow = row + rowStep;
    const nextCol = col + colStep;

    // обычный ход
    if (
      nextRow >= 0 &&
      nextRow < BOARD_SIZE &&
      nextCol >= 0 &&
      nextCol < BOARD_SIZE
    ) {
      const targetIndex = getIndexByRowCol(nextRow, nextCol);
      if (board[targetIndex] == null) moves.push(targetIndex);
    }

    // прыжок через соперника
    const jumpRow = row + rowStep * 2;
    const jumpCol = col + colStep * 2;
    if (
      jumpRow >= 0 &&
      jumpRow < BOARD_SIZE &&
      jumpCol >= 0 &&
      jumpCol < BOARD_SIZE
    ) {
      const midIndex = getIndexByRowCol(row + rowStep, col + colStep);
      const jumpIndex = getIndexByRowCol(jumpRow, jumpCol);

      if (
        board[midIndex] &&
        board[midIndex] !== player &&
        board[jumpIndex] == null
      ) {
        moves.push(jumpIndex);
      }
    }
  }

  return new Set(moves);
}
