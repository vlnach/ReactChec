// src/rules/canMove.js
/** Computes the valid moves for the selected piece */
import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
} from "../constants.js";
import { canMoveQueen } from "./canMoveQueen.js";

/**
 * Unified move computation for any piece.
 * Delegates to canMoveQueen for a queen; uses local rules for regular checkers.
 *
 * @param {Array<null|"dark"|"light"|"queenDark"|"queenLight">} boardCells
 * @param {number|null} originIndex
 * @param {"dark"|"light"} activePlayer
 * @param {boolean} captureOnly
 * @returns {Set<number>}
 */
export function canMove(
  boardCells,
  originIndex,
  activePlayer,
  captureOnly = false
) {
  if (originIndex == null) return new Set();

  const originCell = boardCells[originIndex];

  // Queen — use queen rules
  const isQueenDark = originCell === "queenDark";
  const isQueenLight = originCell === "queenLight";
  if (
    (activePlayer === "dark" && isQueenDark) ||
    (activePlayer === "light" && isQueenLight)
  ) {
    return canMoveQueen(boardCells, originIndex, activePlayer, captureOnly);
  }

  // Regular checker
  const [originRowIndex, originColIndex] = getRowColByIndex(originIndex);
  const forwardRowStep = activePlayer === "dark" ? +1 : -1;

  const slideTargets = [];
  const captureTargets = [];

  // Simple one-step forward diagonals
  for (const colStep of [-1, +1]) {
    const dstRow = originRowIndex + forwardRowStep;
    const dstCol = originColIndex + colStep;

    if (
      dstRow >= 0 &&
      dstRow < BOARD_SIZE &&
      dstCol >= 0 &&
      dstCol < BOARD_SIZE
    ) {
      const dstIndex = getIndexByRowCol(dstRow, dstCol);
      if (boardCells[dstIndex] == null) {
        slideTargets.push(dstIndex);
      }
    }
  }

  // Captures: jump over an opponent by two diagonals
  for (const rowStep of [-1, +1]) {
    for (const colStep of [-1, +1]) {
      const midRow = originRowIndex + rowStep;
      const midCol = originColIndex + colStep;
      const dstRow = originRowIndex + 2 * rowStep;
      const dstCol = originColIndex + 2 * colStep;

      if (
        midRow < 0 ||
        midRow >= BOARD_SIZE ||
        midCol < 0 ||
        midCol >= BOARD_SIZE ||
        dstRow < 0 ||
        dstRow >= BOARD_SIZE ||
        dstCol < 0 ||
        dstCol >= BOARD_SIZE
      )
        continue;

      const midIndex = getIndexByRowCol(midRow, midCol);
      const dstIndex = getIndexByRowCol(dstRow, dstCol);
      const midCell = boardCells[midIndex];
      const dstCell = boardCells[dstIndex];

      const isOpponent =
        midCell != null &&
        !(
          (activePlayer === "dark" &&
            (midCell === "dark" || midCell === "queenDark")) ||
          (activePlayer === "light" &&
            (midCell === "light" || midCell === "queenLight"))
        );

      if (isOpponent && dstCell == null) {
        captureTargets.push(dstIndex);
      }
    }
  }

  if (captureOnly) return new Set(captureTargets);
  if (captureTargets.length > 0) return new Set(captureTargets);
  return new Set(slideTargets);
}
