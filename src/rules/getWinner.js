export function getWinner(board) {
  const hasDark = board.some((cell) => cell === "dark" || cell === "queenDark");
  const hasLight = board.some(
    (cell) => cell === "light" || cell === "queenLight"
  );

  if (!hasDark) return "light"; // light wins
  if (!hasLight) return "dark"; // dark wins

  return null; // no winner yet
}
