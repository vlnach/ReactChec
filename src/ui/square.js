// English comments only
export function Square({ value, onSquareClick, dark, selected, hint }) {
  let className = "square";
  if (dark) className += " square--dark";
  if (selected) className += " square--selected";
  if (hint) className += " square--hint";

  const symbol =
    value === "dark"
      ? "●"
      : value === "light"
      ? "○"
      : value === "queenDark"
      ? "♚"
      : value === "queenLight"
      ? "♔"
      : "";

  return (
    <button className={className} onClick={onSquareClick}>
      <span className="glyph">{symbol}</span>
    </button>
  );
}
