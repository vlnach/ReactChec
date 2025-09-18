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
      {value === "dark"
        ? "●"
        : value === "light"
        ? "○"
        : value === "queenDark"
        ? "♚"
        : value === "queenLight"
        ? "♔"
        : ""}
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
/** главная компонента игры */
export default function Game() {
  const [history, setHistory] = useState([initBoard()]);
  const [selected, setSelected] = useState(null);

  const currentMove = history.length - 1;
  const squares = history[currentMove];
  const darkIsNext = currentMove % 2 === 0;
  const player = darkIsNext ? "dark" : "light";

  const winner = getWinner(squares);
  const validMoves = canMove(squares, selected, player);

  // клик по своей шашке - выделяем или снимаем выделение
  function handleSelect(index) {
    if (squares[index] && squares[index].includes(player)) {
      setSelected(index);
    } else {
      setSelected(null);
    }
  }
  // клик по пустой клетке - если есть выделенная шашка и ход допустим, делаем ход
  function handleMove(toIndex) {
    if (selected != null && validMoves.has(toIndex)) {
      const nextBoard = makeMove(squares, selected, toIndex);
      const nextHistory = [...history.slice(0, currentMove + 1), nextBoard];
      setHistory(nextHistory);
      setSelected(null);
    }
  }

  return (
    <div className="game">
      <div className="game-board">
        <div className="status">
          {winner ? `Winner: ${winner}` : `Turn: ${player}`}
        </div>
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

// функция выполнения хода (специально упрощаю хендл муф, чтобы не запутаться)
function makeMove(board, fromIndex, toIndex) {
  const newBoard = board.slice();
  const [row1, col1] = getRowColByIndex(fromIndex);
  const [row2, col2] = getRowColByIndex(toIndex);

  // прыжок → убираем соперника
  if (Math.abs(row2 - row1) === 2 && Math.abs(col2 - col1) === 2) {
    const midRow = (row1 + row2) / 2;
    const midCol = (col1 + col2) / 2;
    newBoard[getIndexByRowCol(midRow, midCol)] = null;
  }

  newBoard[toIndex] = newBoard[fromIndex];
  newBoard[fromIndex] = null;

  // проверяем, не стала ли шашка дамкой
  newBoard[toIndex] = maybePromoteToKing(newBoard[toIndex], row2);

  return newBoard;
}

/** вычисление допустимых ходов для выделенной шашки */
function canMove(board, selected, player) {
  if (selected == null) return new Set();

  const piece = board[selected];

  // если дамка
  if (
    (player === "dark" && piece === "queenDark") ||
    (player === "light" && piece === "queenLight")
  ) {
    return canMoveQueen(board, selected, player);
  }

  // если обычная шашка
  if (piece !== player) return new Set();

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
        !board[midIndex].includes(player) &&
        board[jumpIndex] == null
      ) {
        moves.push(jumpIndex);
      }
    }
  }

  return new Set(moves);
}

function canMoveQueen(board, selected, player) {
  const [row, col] = getRowColByIndex(selected);
  const moves = [];

  for (const rowStep of [-1, +1]) {
    for (const colStep of [-1, +1]) {
      let nextRow = row + rowStep;
      let nextCol = col + colStep;
      let jumped = false;

      while (
        nextRow >= 0 &&
        nextRow < BOARD_SIZE &&
        nextCol >= 0 &&
        nextCol < BOARD_SIZE
      ) {
        const targetIndex = getIndexByRowCol(nextRow, nextCol);

        if (board[targetIndex] == null) {
          moves.push(targetIndex); // пустая клетка всегда ход
          // если дамка уже перепрыгнула соперника, добавляем только одну клетку и стоп
          if (jumped) break;
        } else {
          if (!board[targetIndex].includes(player) && !jumped) {
            // нашли соперника → следующая клетка после него должна быть пустой
            jumped = true;
          } else {
            // своя фигура или второй подряд соперник → стоп
            break;
          }
        }

        nextRow += rowStep;
        nextCol += colStep;
      }
    }
  }

  return new Set(moves);
}

/** проверка, не стала ли шашка дамкой */
function maybePromoteToKing(piece, row) {
  if (piece === "dark" && row === BOARD_SIZE - 1) return "queenDark";
  if (piece === "light" && row === 0) return "queenLight";
  return piece;
}

function getWinner(board) {
  const hasDark = board.some((cell) => cell === "dark" || cell === "queenDark");
  const hasLight = board.some(
    (cell) => cell === "light" || cell === "queenLight"
  );

  if (!hasDark) return "light"; // светлые win
  if (!hasLight) return "dark"; // тёмные win

  return null; // пока никто не выиграл
}
