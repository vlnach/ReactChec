# Checkers (Russian Draughts) — React

A compact but complete implementation of **Russian checkers** in React: setup, legal moves (men + flying kings), promotion, **mandatory capture with chaining**, and basic **win detection**. Core rules are unit-tested.

Live demo: [Open in browser](https://vlnach.github.io/ReactChec/)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Game Logic](#key-game-logic)
- [Why Set](#why-set)
- [Design Decisions](#design-decisions)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **8×8 board** (play on dark squares only)
- **Men (regular pieces)**
  - Move one diagonal square forward
  - Capture diagonally **forward or backward**
- **Kings (flying kings)**
  - Move any number of diagonal squares
  - Capture by jumping exactly one opponent and must land on the first empty square after it (current variant)
- **Mandatory capture & chaining**
  - After a capture, if the same piece can continue capturing, the turn continues with capture-only options
- **Promotion**
  - A man promotes to `queenDark` / `queenLight` on the far rank, including during a capture sequence
- **Win detection**
  - Declares a winner when the opponent has no pieces left
- **Visual cues**
  - Selected square, legal move hints (dots), active player badge

Rules note: in Russian checkers, men may capture backward. The code reflects that.

## Tech Stack

- React (Vite or CRA)
- Plain CSS for styling
- Jest or Vitest for unit tests

## Getting Started

Install and run in development:

```bash
npm install
npm run dev    # if using Vite
# or
npm start      # if using CRA
```

Open the app: http://localhost:3000

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
  App.jsx            # UI + game state and orchestration
  constants.js       # BOARD_SIZE, index<->row/col helpers, isDarkCell, isMyPiece
  rules/
    moves.js         # getAvailableMoves, canMoveQueen — core rules
    makeMove.js      # apply move: remove captured, move piece, promotion
  styles.css         # styling and CSS variables
  index.js           # app entry
__tests__/
  *.test.js          # unit tests for rules and edge cases
public/
  index.html
```

If rules currently live inside `App.jsx`, that's fine; `rules/` shows a possible future split.

## Key Game Logic

### getAvailableMoves(boardCells, originIndex, activePlayer, captureOnly=false): Set<number>

- Returns a Set of legal destination cell indexes for the selected piece.
- Throws an Error if `originIndex == null` to distinguish invalid requests from "no moves".
- When `captureOnly` is `true`, returns only capture landings (used during chaining).

### canMoveQueen(boardCells, originIndex, activePlayer, captureOnly=false): Set<number>

- Same contract for flying kings.
- In this variant the king must land on the first empty square after the captured piece.

### makeMove(board, fromIndex, toIndex)

- Applies the move, removes the jumped piece (if any), and performs promotion via `maybePromoteToKing`.

### getWinner(board): "dark" | "light" | null

- Returns the winner or `null` if no winner yet.

Helpers (constants.js)

- `BOARD_SIZE = 8`
- `getIndexByRowCol(row, col)` / `getRowColByIndex(i)`
- `isDarkCell(row, col)` — playable squares
- `isMyPiece(player, cell)` — ownership check used by the UI

## Why Set

Move targets are represented as `Set<number>`:

- Guarantees no duplicates
- Fast lookups with `moves.has(index)`
- Semantically clearer than arrays for unordered unique collections

Internally `slideTargets` and `captureTargets` are also `Set`s, and the public API returns a new Set(...) to keep immutability.

## Design Decisions

- Error on invalid input: when `originIndex` is `null`, rule functions throw; the caller decides when to compute moves. This distinguishes "no legal moves" (empty set) from "invalid request" (exception).
- King landing rule: current variant enforces landing on the first empty square after the captured piece. International draughts allow landing beyond; this can be made configurable.
- Chaining enforcement: after any capture, if the same piece can capture again, the UI restricts to capture-only moves until the chain ends.

## Roadmap

- Global "must capture" at turn start (if any capture exists on the board, disallow quiet moves)
- Draw handling (e.g., no legal moves while pieces remain)
- Undo/Redo UI (history navigation)
- Configurable king landing rule (first empty vs any beyond)
- Simple bot / online play
- More tests (promotion during chain, multi-branch captures, edge cases)

## Troubleshooting

- "React is not defined" in tests: if a test renders JSX, ensure `import React from 'react'` or enable the automatic JSX runtime in your test runner.
- Vertical gaps between rows: add `.board { line-height: 0; }` and render each row with `display: flex`.
- `Error: originIndex ... cannot be null`: by design, the caller must guard against `null` before invoking rules.

## License

MIT
