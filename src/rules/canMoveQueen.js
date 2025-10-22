import {
  BOARD_SIZE,
  getIndexByRowCol,
  getRowColByIndex,
} from "../constants.js";

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
  if (originIndex == null) return new Set();

  const [originRowIndex, originColIndex] = getRowColByIndex(originIndex);

  const stepOptions = [
    { rowStep: -1, colStep: -1 },
    { rowStep: -1, colStep: +1 },
    { rowStep: +1, colStep: -1 },
    { rowStep: +1, colStep: +1 },
  ];

  /** Cells for regular slides (we glide until an obstacle) */
  const slideTargets = [];
  /** Landing cells for captures (strictly the first empty cell right after an opponent) */
  const captureTargets = [];

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
          slideTargets.push(currentIndex);
        } else {
          // right after the opponent — the only valid landing for a capture
          captureTargets.push(currentIndex);
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
  if (captureTargets.length > 0) return new Set(captureTargets);

  // Otherwise — return regular slide moves
  return new Set(slideTargets);
}
