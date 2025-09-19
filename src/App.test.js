import { expect, it, describe } from "vitest";
import { initBoard } from "./App.jsx";
import { maybePromoteToKing } from "./App.jsx";
import { canMoveQueen } from "./App.jsx";
import { getIndexByRowCol } from "./constants.js";
import { canMove } from "./App.jsx";
import { Square } from "./App.jsx";

describe("Square", () => {
  it("рисует символ для dark", () => {
    const onClick = () => {};
    const square = Square({ value: "dark", isSelected: false, onClick });
    expect(square.props.children).toBe("●");
  });
  it("рисует символ для light", () => {
    const onClick = () => {};
    const square = Square({ value: "light", isSelected: false, onClick });
    expect(square.props.children).toBe("○");
  });
  it("рисует символ для queenDark", () => {
    const onClick = () => {};
    const square = Square({ value: "queenDark", isSelected: false, onClick });
    expect(square.props.children).toBe("♚");
  });
  it("рисует символ для queenLight", () => {
    const onClick = () => {};
    const square = Square({ value: "queenLight", isSelected: false, onClick });
    expect(square.props.children).toBe("♔");
  });
  it("рисует пустую клетку", () => {
    const onClick = () => {};
    const square = Square({ value: null, isSelected: false, onClick });
    expect(square.props.children).toBe("");
  });
});

describe("initBoard", () => {
  it("generates a correct checkers board", () => {
    const actual = initBoard();
    const expected = [
      null,
      "dark",
      null,
      "dark",
      null,
      "dark",
      null,
      "dark",
      "dark",
      null,
      "dark",
      null,
      "dark",
      null,
      "dark",
      null,
      null,
      "dark",
      null,
      "dark",
      null,
      "dark",
      null,
      "dark",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "light",
      null,
      "light",
      null,
      "light",
      null,
      "light",
      null,
      null,
      "light",
      null,
      "light",
      null,
      "light",
      null,
      "light",
      "light",
      null,
      "light",
      null,
      "light",
      null,
      "light",
      null,
    ];
    expect(actual).toEqual(expected);
  });
});

describe("maybePromoteToKing", () => {
  it("не назначает дамку, если в середине", () => {
    expect(maybePromoteToKing("dark", 3)).toBe("dark");
    expect(maybePromoteToKing("light", 4)).toBe("light");
  });
  it("назначает дамку темной шашке, если она достигла последней строки", () => {
    expect(maybePromoteToKing("dark", 7)).toBe("queenDark");
  });
  it("назначает дамку светлой шашке, если она достигла первой строки", () => {
    expect(maybePromoteToKing("light", 0)).toBe("queenLight");
  });

  it("не изменяет дамку", () => {
    expect(maybePromoteToKing("queenDark", 7)).toBe("queenDark");
    expect(maybePromoteToKing("queenLight", 0)).toBe("queenLight");
  });
  it("проверка нуля у этой функции null", () => {
    expect(maybePromoteToKing(null, 0)).toBe(null);
    expect(maybePromoteToKing(null, 7)).toBe(null);
  });
});

describe("canMoveQueen", () => {
  it("корректно считает ходы дамки из центра", () => {
    // индекс по координатам r,c
    const board = Array(64).fill(null);

    board[getIndexByRowCol(3, 3)] = "queenDark";
    board[getIndexByRowCol(2, 2)] = "light"; // соперник слева-сверху на (2,2) — можно перепрыгнуть на (1,1)
    board[getIndexByRowCol(4, 4)] = "dark"; // своя фигура справа-снизу — направление блокируется

    const actual = canMoveQueen(board, getIndexByRowCol(3, 3), "dark");

    // Диагонали:
    // ↖ (1,1) после прыжка через (2,2)
    // ↗ (2,4), (1,5), (0,6)
    // ↙ (4,2), (5,1), (6,0)
    // ↘ блок из-за своей на (4,4)

    const expected = new Set([
      getIndexByRowCol(1, 1),
      getIndexByRowCol(2, 4),
      getIndexByRowCol(1, 5),
      getIndexByRowCol(0, 6),
      getIndexByRowCol(4, 2),
      getIndexByRowCol(5, 1),
      getIndexByRowCol(6, 0),
    ]);

    expect(actual).toEqual(expected);
  });

  it("корректно считает ходы дамки из угла", () => {
    // a8: (0,0), рядом по диагонали враг на (1,1)
    const board = Array(64).fill(null);
    board[getIndexByRowCol(0, 0)] = "queenLight";
    board[getIndexByRowCol(1, 1)] = "dark";

    const actual = canMoveQueen(board, getIndexByRowCol(0, 0), "light");

    // Можно только перепрыгнуть на первую пустую за ним: (2,2)
    const expected = new Set([getIndexByRowCol(2, 2)]);

    expect(actual).toEqual(expected);
  });
});

describe("canMove", () => {
  it("не позволяет ходить, если не наша шашка", () => {
    const board = Array(64).fill(null);
    board[getIndexByRowCol(5, 0)] = "light"; // светлая шашка на (5,0)

    expect(canMove(board, getIndexByRowCol(5, 0), "dark")).toEqual(new Set());
    expect(
      canMove(board, getIndexByRowCol(5, 0), "light").size
    ).toBeGreaterThan(0);
  });

  it("не позволяет ходить из пустой клетки", () => {
    const board = Array(64).fill(null);
    expect(canMove(board, getIndexByRowCol(5, 0), "dark")).toEqual(new Set());
    expect(canMove(board, getIndexByRowCol(5, 0), "light")).toEqual(new Set());
  });

  it("корректно считает ходы простой шашки", () => {
    const board = Array(64).fill(null);
    board[getIndexByRowCol(5, 0)] = "light"; // светлая шашка на (5,0)

    const actual = canMove(board, getIndexByRowCol(5, 0), "light");

    // может пойти на (4,1)
    const expected = new Set([getIndexByRowCol(4, 1)]);

    expect(actual).toEqual(expected);
  });

  it("корректно считает ходы простой шашки с прыжком", () => {
    const board = Array(64).fill(null);
    board[getIndexByRowCol(5, 0)] = "light"; // светлая шашка на (5,0)
    board[getIndexByRowCol(4, 1)] = "dark"; // темная соперник на (4,1)

    const actual = canMove(board, getIndexByRowCol(5, 0), "light");

    // может перепрыгнуть на (3,2)
    const expected = new Set([getIndexByRowCol(3, 2)]);

    expect(actual).toEqual(expected);
  });
});

describe("makeMove", () => {
  it("делает простой ход", () => {
    const board = Array(64).fill(null);
    board[getIndexByRowCol(5, 0)] = "light"; // светлая шашка на (5,0)

    const newBoard = makeMove(
      board,
      getIndexByRowCol(5, 0),
      getIndexByRowCol(4, 1)
    );

    expect(newBoard[getIndexByRowCol(5, 0)]).toBe(null);
    expect(newBoard[getIndexByRowCol(4, 1)]).toBe("light");
  });

  it("делает прыжок и убирает соперника", () => {
    const board = Array(64).fill(null);
    board[getIndexByRowCol(5, 0)] = "light"; // светлая шашка на (5,0)
    board[getIndexByRowCol(4, 1)] = "dark"; // темная соперник на (4,1)

    const newBoard = makeMove(
      board,
      getIndexByRowCol(5, 0),
      getIndexByRowCol(3, 2)
    );

    expect(newBoard[getIndexByRowCol(5, 0)]).toBe(null);
    expect(newBoard[getIndexByRowCol(4, 1)]).toBe(null); // соперник убит
    expect(newBoard[getIndexByRowCol(3, 2)]).toBe("light");
  });

  it("превращает в дамку, если дошли до конца", () => {
    const board = Array(64).fill(null);
    board[getIndexByRowCol(1, 2)] = "light"; // светлая шашка на (1,2)

    const newBoard = makeMove(
      board,
      getIndexByRowCol(1, 2),
      getIndexByRowCol(0, 3)
    );

    expect(newBoard[getIndexByRowCol(1, 2)]).toBe(null);
    expect(newBoard[getIndexByRowCol(0, 3)]).toBe("queenLight"); // стала дамкой
  });
});
