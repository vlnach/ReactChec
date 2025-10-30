/** Computes the valid moves for the selected piece */
import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
} from "../constants.js";

/**
 * Unified move computation for any piece.
 * Delegates to canMoveQueen for a queen; uses local rules for regular checkers.
 *
 * @param {Array<null|"dark"|"light"|"queenDark"|"queenLight">} boardCells
 * @param {number|null} originIndex
 * @param {"dark"|"light"} activePlayer
 * @param {boolean} captureOnly
 *
 * @returns {Set<number>} A set of board indexes where this piece can move.
 */
export function getAvailableMoves(
  boardCells,
  originIndex,
  activePlayer,
  captureOnly = false
) {
  if (originIndex == null) {
    return new Set();
  }

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

  const slideTargets = new Set();
  const captureTargets = new Set();

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
        slideTargets.add(dstIndex);
      }
    }
  }

  // Captures: jump over an opponent by two diagonals
  for (const rowStep of [-1, +1]) {
    for (const colStep of [-1, +1]) {
      const dstRow = originRowIndex + 2 * rowStep;
      const dstCol = originColIndex + 2 * colStep;

      if (
        dstRow < 0 ||
        dstRow >= BOARD_SIZE ||
        dstCol < 0 ||
        dstCol >= BOARD_SIZE
      )
        continue;

      const midIndex = getIndexByRowCol(
        originRowIndex + rowStep,
        originColIndex + colStep
      );
      const dstIndex = getIndexByRowCol(dstRow, dstCol);
      const midCell = boardCells[midIndex];
      const dstCell = boardCells[dstIndex];

      const isOpponent =
        activePlayer === "dark"
          ? midCell === "light" || midCell === "queenLight"
          : midCell === "dark" || midCell === "queenDark";

      if (isOpponent && dstCell == null) {
        captureTargets.add(dstIndex);
      }
    }
  }

  // If we are continuing a capture chain — return capture landings only
  if (captureOnly) return new Set(captureTargets);

  // If at least one capture exists — by priority return captures only
  if (captureTargets.size > 0) return new Set(captureTargets);

  // Otherwise — return regular slide moves
  return new Set(slideTargets);
}

/**
 * Computes valid moves for a queen (kinged checker).
 * Returns a Set of target empty cell indexes:
 *
 * In the current project rules exactly one capture per move is performed (see makeMove.js).
 *
 * @param {Array<null|"dark"|"light"|"queenDark"|"queenLight">} boardCells
 * @param {number} originIndex
 * @param {"dark"|"light"} activePlayer
 * @param {boolean} captureOnly - when true, return capture landings only (for capture chains)
 * @returns {Set<number>}
 */
export function canMoveQueen(
  boardCells,
  originIndex,
  activePlayer,
  captureOnly = false
) {
  if (originIndex == null) {
    return new Set();
  }

  const [originRowIndex, originColIndex] = getRowColByIndex(originIndex);

  const stepOptions = [
    { rowStep: -1, colStep: -1 },
    { rowStep: -1, colStep: +1 },
    { rowStep: +1, colStep: -1 },
    { rowStep: +1, colStep: +1 },
  ];

  /** Cells for regular slides (we glide until an obstacle) */
  const slideTargets = new Set();
  /** Landing cells for captures (strictly the first empty cell right after an opponent) */
  const captureTargets = new Set();

  for (const { rowStep, colStep } of stepOptions) {
    let rowIndex = originRowIndex + rowStep;
    let colIndex = originColIndex + colStep;

    let opponentMet = false; // whether an opposing piece was encountered on this ray

    while (
      rowIndex >= 0 &&
      rowIndex < BOARD_SIZE &&
      colIndex >= 0 &&
      colIndex < BOARD_SIZE
    ) {
      const currentIndex = getIndexByRowCol(rowIndex, colIndex);
      const currentCell = boardCells[currentIndex];

      // Empty cell
      if (currentCell == null) {
        if (!opponentMet) {
          // before meeting an opponent — regular sliding target
          slideTargets.add(currentIndex);
        } else {
          // right after the opponent — the only valid landing for a capture
          captureTargets.add(currentIndex);
          // do not go further in this direction (per current project rules)
          break;
        }
      } else {
        // Occupied cell
        const isMyPiece =
          (activePlayer === "dark" &&
            (currentCell === "dark" || currentCell === "queenDark")) ||
          (activePlayer === "light" &&
            (currentCell === "light" || currentCell === "queenLight"));

        if (isMyPiece) {
          // Own piece blocks the ray — cannot go further
          break;
        } else {
          // Opponent encountered
          if (opponentMet) {
            // Second opponent in a row prevents a capture on this ray
            break;
          }
          // Mark that we met an opponent and check the cell beyond
          opponentMet = true;
        }
      }

      rowIndex += rowStep;
      colIndex += colStep;
    }
  }

  // If we are continuing a capture chain — return capture landings only
  if (captureOnly) return new Set(captureTargets);

  // If at least one capture exists — by priority return captures only
  if (captureTargets.size > 0) return new Set(captureTargets);

  // Otherwise — return regular slide moves
  return new Set(slideTargets);
}
