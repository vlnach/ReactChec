import { useState } from "react";
import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
  isMyPiece,
} from "./constants.js";

import { Board } from "./ui/board.jsx";
import { initBoard } from "./ui/initBoard.js";
import { canMove } from "./rules/canMove.js";
import { makeMove } from "./rules/makeMove.js";
import { getWinner } from "./rules/getWinner.js";

// components

/** main component */
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
      ? canMove(squares, mustJumpFrom, player, true) // show only captures
      : canMove(squares, selected, player); // normal mode

  // click on own piece - select or deselect
  function handleSelect(index) {
    if (winner) return;
    if (mustJumpFrom != null && index !== mustJumpFrom) return;

    const cell = squares[index];
    setSelected(isMyPiece(player, cell) ? index : null);
  }

  // click on empty square - if there is a selected piece and the move is valid, make the move
  function handleMove(toIndex) {
    if (selected == null || !validMoves.has(toIndex)) return;

    const [r1, c1] = getRowColByIndex(selected);
    const [r2, c2] = getRowColByIndex(toIndex);
    const moving = squares[selected];
    const dR = r2 - r1,
      dC = c2 - c1;
    const absR = Math.abs(dR),
      absC = Math.abs(dC);

    // 1) was it a capture?
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

    // 2) Make the move
    const nextBoard = makeMove(squares, selected, toIndex);

    // 3) If it was a capture — check if we can keep capturing with the same piece
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

    // 4) Update the state
    if (wasCapture && canChain) {
      // replace the last position to NOT change the player
      const replaced = history.slice();
      replaced[currentMove] = nextBoard;
      setHistory(replaced);

      setSelected(toIndex); // continue capturing with the same piece
      setMustJumpFrom(toIndex); // <<< must continue from this square
    } else {
      const nextHistory = [...history.slice(0, currentMove + 1), nextBoard];
      setHistory(nextHistory);
      setSelected(null);
      setMustJumpFrom(null); // <<< chain ended
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
