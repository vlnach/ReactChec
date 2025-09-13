import { useState } from "react";

const N = 8; // размер доски 8x8

// вспомогательные функции
/** индекс в массиве по координатам */
const getIndexByRowCol = (r, c) => r * N + c; //
const getRowColumnByIndex = (i) => [Math.floor(i / N), i % N]; // координаты по индексу в массиве
const isDarkCell = (r, c) => (r + c) % 2 === 1; // черная клетка = могут стоять шашки, на белой нельзя

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
      {[...Array(N)].map((_, r) => (
        <div className="board-row" key={r}>
          {[...Array(N)].map((_, c) => {
            const i = getIndexByRowCol(r, c); // индекс клетки в массиве
            return (
              <Square
                key={i}
                value={squares[i]}
                dark={isDarkCell(r, c)}
                selected={i === selected}
                hint={validMoves.has(i)}
                onSquareClick={
                  () =>
                    squares[i]
                      ? onSelect(i) // клик по шашке → выбрать
                      : onMove(i) // клик по пустой клетке → ход
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

  const validMoves = canMove(squares, selected, player); // допустимые ходы для выделенной шашки - можем или не можем ходить

  //  клик по своей шашке - выделяем или снимаем выделение
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
  const board = Array(N * N).fill(null);
  // расставляем темные шашки
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < N; c++) {
      if (isDarkCell(r, c)) board[getIndexByRowCol(r, c)] = "dark";
    }
  }
  // расставляем светлые шашки
  for (let r = N - 3; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isDarkCell(r, c)) board[getIndexByRowCol(r, c)] = "light";
    }
  }
  return board;
}

/** вычисление допустимых ходов для выделенной шашки */
function canMove(board, selected, player) {
  if (selected == null || board[selected] !== player) return new Set();
  const [r, c] = getRowColumnByIndex(selected);
  const rowDelta = player === "dark" ? +1 : -1;
  const moves = [];

  for (const dc of [-1, +1]) {
    const nr = r + rowDelta;
    const nc = c + dc;
    if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
      const to = getIndexByRowCol(nr, nc);
      if (board[to] == null) moves.push(to);
    }
  }

  return new Set(moves);
}
