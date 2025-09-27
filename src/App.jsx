import React from "react";
import { useState } from "react";
import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
  isDarkCell,
} from "./constants.js";

// компоненты

export function Square({ value, onSquareClick, dark, selected, hint }) {
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
  const [mustJumpFrom, setMustJumpFrom] = useState(null);

  const currentMove = history.length - 1;
  const squares = history[currentMove];
  const darkIsNext = currentMove % 2 === 0;
  const player = darkIsNext ? "dark" : "light";

  const winner = getWinner(squares);
  const validMoves =
    mustJumpFrom != null
      ? canMove(squares, mustJumpFrom, player, true) // показываем только прыжки
      : canMove(squares, selected, player); // обычный режим

  // клик по своей шашке - выделяем или снимаем выделение
  function handleSelect(index) {
    if (winner) {
      return;
    } else if (mustJumpFrom != null && index !== mustJumpFrom) return;

    if (
      squares[index] &&
      squares[index].toLowerCase().includes(player.toLowerCase())
    ) {
      setSelected(index);
    } else {
      setSelected(null);
    }
  }
  // клик по пустой клетке - если есть выделенная шашка и ход допустим, делаем ход
  function handleMove(toIndex) {
    if (selected == null || !validMoves.has(toIndex)) return;

    const [r1, c1] = getRowColByIndex(selected);
    const [r2, c2] = getRowColByIndex(toIndex);
    const moving = squares[selected];
    const dR = r2 - r1,
      dC = c2 - c1;
    const absR = Math.abs(dR),
      absC = Math.abs(dC);

    // 1) Было ли взятие?
    let wasCapture = false;
    if (moving === "queenDark" || moving === "queenLight") {
      if (absR === absC && absR > 1) {
        const sR = Math.sign(dR),
          sC = Math.sign(dC);
        let rr = r1 + sR,
          cc = c1 + sC;
        while (rr !== r2 && cc !== c2) {
          const cell = squares[getIndexByRowCol(rr, cc)];
          if (cell) {
            wasCapture = true;
            break;
          }
          rr += sR;
          cc += sC;
        }
      }
    } else {
      wasCapture = absR === 2 && absC === 2;
    }

    // 2) Делаем ход
    const nextBoard = makeMove(squares, selected, toIndex);

    // 3) Если это было взятие — проверяем, можно ли бить дальше той же фигурой
    let canChain = false;
    if (wasCapture) {
      const playerIsDark = player === "dark";
      const isMy = (cell) =>
        playerIsDark
          ? cell === "dark" || cell === "queenDark"
          : cell === "light" || cell === "queenLight";

      const pieceNow = nextBoard[toIndex];
      const [r, c] = [r2, c2];

      if (pieceNow === "queenDark" || pieceNow === "queenLight") {
        // дамка: ищем любого соперника с пустыми клетками за ним
        for (const dr of [-1, +1]) {
          for (const dc of [-1, +1]) {
            let rr = r + dr,
              cc = c + dc,
              seenEnemy = false;
            while (rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE) {
              const cell = nextBoard[getIndexByRowCol(rr, cc)];
              if (!cell) {
                if (seenEnemy) {
                  canChain = true;
                  break;
                }
                rr += dr;
                cc += dc;
                continue;
              }
              if (isMy(cell)) break;
              if (seenEnemy) break;
              seenEnemy = true;
              rr += dr;
              cc += dc;
            }
            if (canChain) break;
          }
        }
      } else {
        // обычная шашка: соперник по диагонали + пусто за ним
        for (const dr of [-1, +1]) {
          for (const dc of [-1, +1]) {
            const rMid = r + dr,
              cMid = c + dc;
            const rDst = r + 2 * dr,
              cDst = c + 2 * dc;
            if (
              rDst < 0 ||
              rDst >= BOARD_SIZE ||
              cDst < 0 ||
              cDst >= BOARD_SIZE
            )
              continue;
            const mid = nextBoard[getIndexByRowCol(rMid, cMid)];
            const dst = nextBoard[getIndexByRowCol(rDst, cDst)];
            if (mid && !isMy(mid) && !dst) {
              canChain = true;
              break;
            }
          }
          if (canChain) break;
        }
      }
    }

    // 4) Либо продолжаем ту же «цепочку», либо завершаем ход как раньше
    if (wasCapture && canChain) {
      // заменяем последнюю позицию, чтобы НЕ сменился игрок
      const replaced = history.slice();
      replaced[currentMove] = nextBoard;
      setHistory(replaced);

      setSelected(toIndex); // продолжаем бить этой же фигурой
      setMustJumpFrom(toIndex); // <<< обязаны продолжать с этой клетки
    } else {
      const nextHistory = [...history.slice(0, currentMove + 1), nextBoard];
      setHistory(nextHistory);
      setSelected(null);
      setMustJumpFrom(null); // <<< серия закончилась
    }
  }

  return (
    <div className="game">
      <div className="game-board">
        <div className="status">
          {winner ? (
            <>
              <span className={`${winner}`} />
              Winner: {winner}
            </>
          ) : (
            <>
              <span className={`${player}`} />
              Turn: {player}
            </>
          )}
        </div>

        <div className="board">
          <Board
            squares={squares}
            selected={selected}
            validMoves={validMoves}
            onSelect={handleSelect}
            onMove={handleMove}
          />
        </div>
      </div>
    </div>
  );
}

// инициализация доски, расстановка шашек
export function initBoard() {
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
export function makeMove(board, fromIndex, toIndex) {
  const newBoard = board.slice();
  const [row1, col1] = getRowColByIndex(fromIndex);
  const [row2, col2] = getRowColByIndex(toIndex);

  const dRow = row2 - row1;
  const dCol = col2 - col1;
  const absR = Math.abs(dRow);
  const absC = Math.abs(dCol);

  // Если ход по диагонали длиннее чем на 1 клетку — ищем захваченную фигуру
  if (absR === absC && absR > 1) {
    const stepR = dRow > 0 ? 1 : -1;
    const stepC = dCol > 0 ? 1 : -1;
    let r = row1 + stepR;
    let c = col1 + stepC;

    while (r !== row2 && c !== col2) {
      const idx = getIndexByRowCol(r, c);
      if (newBoard[idx] != null) {
        // это и есть перепрыгнутая фигура — снимаем
        newBoard[idx] = null;
        break; // из canMoveQueen знаем, что второй быть не может
      }
      r += stepR;
      c += stepC;
    }
  } else if (absR === 2 && absC === 2) {
    // классический прыжок обычной шашки на 2 клетки
    const midRow = (row1 + row2) / 2;
    const midCol = (col1 + col2) / 2;
    newBoard[getIndexByRowCol(midRow, midCol)] = null;
  }

  // перемещаем фигуру
  newBoard[toIndex] = newBoard[fromIndex];
  newBoard[fromIndex] = null;

  // возможное превращение в дамку
  newBoard[toIndex] = maybePromoteToKing(newBoard[toIndex], row2);

  return newBoard;
}

/** вычисление допустимых ходов для выделенной шашки */
export function canMove(board, selected, player, captureOnly = false) {
  if (selected == null) return new Set();

  const piece = board[selected];

  // дамка — пробрасываем флаг в canMoveQueen
  if (
    (player === "dark" && piece === "queenDark") ||
    (player === "light" && piece === "queenLight")
  ) {
    return canMoveQueen(board, selected, player, captureOnly);
  }

  // обычная шашка
  if (piece !== player) return new Set();

  const [row, col] = getRowColByIndex(selected);
  const rowStep = player === "dark" ? +1 : -1;

  const steps = []; // обычные ходы (только вперёд)
  const jumps = []; // прыжки (во все стороны)

  // ----- обычные шаги: только вперёд -----
  for (const colStep of [-1, +1]) {
    const nRow = row + rowStep;
    const nCol = col + colStep;
    if (nRow >= 0 && nRow < BOARD_SIZE && nCol >= 0 && nCol < BOARD_SIZE) {
      const i = getIndexByRowCol(nRow, nCol);
      if (board[i] == null) steps.push(i);
    }
  }

  // ----- прыжки: во все четыре диагонали -----
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

  // если мы в режиме "только рубка" (продолжаем цепочку) — отдаём только прыжки
  // иначе прыжки имеют приоритет над обычными шагами
  const result = captureOnly ? jumps : jumps.length ? jumps : steps;
  return new Set(result);
}

export function canMoveQueen(board, selected, player, captureOnly = false) {
  const [row, col] = getRowColByIndex(selected);
  const moves = [];

  for (const rStep of [-1, +1]) {
    for (const cStep of [-1, +1]) {
      let r = row + rStep;
      let c = col + cStep;
      let jumped = false; // встретили противника?

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        const idx = getIndexByRowCol(r, c);
        const cell = board[idx];

        if (cell == null) {
          // пусто
          if (!captureOnly || jumped) {
            // можно ходить, если не в режиме «только рубка»,
            // или это первая пустая клетка сразу ПОСЛЕ битой фигуры
            moves.push(idx);
            if (jumped) break; // в русских шашках — именно первая после биты
          }
        } else {
          // встретили фигуру — проверяем, своя/чужая
          const isMy =
            (player === "dark" && (cell === "dark" || cell === "queenDark")) ||
            (player === "light" && (cell === "light" || cell === "queenLight"));

          if (!isMy && !jumped) {
            jumped = true; // следующая пустая — посадочная
          } else {
            break; // своя или второй подряд враг — стоп
          }
        }

        r += rStep;
        c += cStep;
      }
    }
  }

  return new Set(moves);
}

/** проверка, не стала ли шашка дамкой */
export function maybePromoteToKing(piece, row) {
  if (piece === "dark" && row === BOARD_SIZE - 1) return "queenDark";
  if (piece === "light" && row === 0) return "queenLight";
  return piece;
}

export function getWinner(board) {
  const hasDark = board.some((cell) => cell === "dark" || cell === "queenDark");
  const hasLight = board.some(
    (cell) => cell === "light" || cell === "queenLight"
  );

  if (!hasDark) return "light"; // светлые win
  if (!hasLight) return "dark"; // тёмные win

  return null; // пока никто не выиграл
}
