Checkers (Russian draughts) — React

A small implementation of Russian checkers in React: piece setup, legal moves, promotion to king, mandatory capture with chaining, and win detection. The project also includes unit tests for the core game logic.

What’s implemented

8×8 board on dark squares only.

Men (regular pieces)

Move forward one square (diagonally).

Capture diagonally forward or backward by jumping over an adjacent opponent piece onto the empty square immediately beyond.

Kings (“flying kings”)

Move any number of squares diagonally.

Capture by jumping over exactly one opponent piece and landing on the first empty square after it (current variant).

Mandatory capture

If your move captured at least one piece and the same piece can continue capturing, your turn does not end; you must continue with that piece (chaining).

Promotion

A man promotes upon reaching the far edge: dark → queenDark, light → queenLight. Promotion also occurs during a capture sequence.

Win detection

The game declares a winner when the opponent has no pieces left.

Visual cues:

Selected square, legal moves (hint dots), and current player badge.

Rules note: In Russian checkers, men may capture backward. The code reflects that.

Tech stack

React + react-scripts-style dev server

Plain CSS

Jest (via react-scripts) for tests

Getting started

Install and run:

npm install
npm start


Visit http://localhost:3000.

Run tests:

npm test

Project structure
src/
  App.jsx          # React components + game logic and state
  constants.js     # 8×8 helpers: index<->row/col, dark-square check
  index.js         # app entry
  styles.css       # UI styles
  App.test.js      # sample unit tests
public/
  index.html

Key functions (where the rules live)

initBoard() — initial 12 vs 12 setup on dark squares.

canMove(board, selected, player, captureOnly?) — legal moves for a man.

Returns a Set of destination indexes.

If captureOnly is true, returns only captures (used during chaining).

canMoveQueen(board, selected, player, captureOnly?) — same for kings.

makeMove(board, fromIndex, toIndex) — applies a move:

Removes the jumped piece if any,

Moves the piece,

Applies promotion (via maybePromoteToKing).

maybePromoteToKing(piece, row) — turns a man into queenDark / queenLight on the last rank.

getWinner(board) — "dark", "light", or null.

Components & state

Square — a single board cell (symbols: ● ○ ♚ ♔).

Board — 8×8 grid of Square.

Game — stateful container:

history: list of board positions (enables turn switching and paves the way for undo/redo).

selected: currently picked square.

mustJumpFrom: when set, the user must continue the capture chain with that piece; UI shows only landing squares that continue the chain.

Computed: player, winner, validMoves.

Move flow

Click your piece ⇒ it becomes selected.

Click a highlighted destination ⇒ makeMove applies the move.

If the move captured and the same piece can capture again:

Replace the latest board without advancing the move counter,

Set mustJumpFrom to the new square,

Keep the same player’s turn and show capture-only moves.

Otherwise, append to history, clear selections, pass the turn.

Styling & customization

All styles are in styles.css.

Centered board card with soft shadow and rounded corners.

Selected square uses a focus outline; legal moves are green dots.

To change square size, tweak a CSS variable:

:root { --square-size: 72px; }
.square {
  width: var(--square-size);
  height: var(--square-size);
}
.board { line-height: 0; } /* removes row gaps */


You can also theme colors for .square--dark, .square--selected, and .square--hint.

Sample tests

Initial setup:

import { initBoard } from './App.jsx';

test('initial board has 12 dark and 12 light men', () => {
  const b = initBoard();
  expect(b.filter(x => x === 'dark').length).toBe(12);
  expect(b.filter(x => x === 'light').length).toBe(12);
});


Backward capture by a man (allowed in Russian checkers):

import { canMove } from './App.jsx';
import { getIndexByRowCol } from './constants.js';

test('a light man can capture backward', () => {
  const b = Array(64).fill(null);
  // light at (4,4), dark at (5,5) -> capture landing (6,6)
  b[getIndexByRowCol(4,4)] = 'light';
  b[getIndexByRowCol(5,5)] = 'dark';
  const moves = canMove(b, getIndexByRowCol(4,4), 'light');
  expect(moves.has(getIndexByRowCol(6,6))).toBe(true);
});


King’s landing rule (first empty square after the captured piece in this variant):

import { canMoveQueen } from './App.jsx';
import { getIndexByRowCol } from './constants.js';

test('queen must land on the first empty square after a single enemy', () => {
  const b = Array(64).fill(null);
  b[getIndexByRowCol(3,3)] = 'queenDark';
  b[getIndexByRowCol(2,2)] = 'light'; // enemy
  // Only the first empty after (2,2) is valid: (1,1)
  const moves = canMoveQueen(b, getIndexByRowCol(3,3), 'dark', true);
  expect(moves.has(getIndexByRowCol(1,1))).toBe(true);
});


If your tests instantiate JSX (e.g., rendering <Square /> directly), remember to import React from 'react' in that test file (depending on your tooling).

Known limitations / Nice-to-haves

Global “must capture” at turn start: currently, the app strictly enforces continuation of a capture sequence with the same piece. Many rule sets also require that if any capture exists on the board, only capturing moves are allowed. You can add a pre-check before selection to enforce that globally.

Draws (no legal moves but pieces remain) — currently returns winner = null; you can add explicit draw handling.

Undo/Redo (history UI).

Configurable king landing rule:

Current: land on the first empty after the jumped piece.

Variant: allow landing on any empty beyond (International draughts).

Bot / online play.

More tests: e.g., promotion during a capture sequence and immediate continuation, multi-capture branches, etc.

Troubleshooting

“React is not defined” in tests — if a test uses JSX, add import React from 'react' at the top (or ensure your test runner is configured for the automatic JSX runtime).

Squares have vertical gaps — ensure .board { line-height: 0; } is present and each row is display:flex.

Rules refresher (short)

Men move forward, capture any direction (forward/backward).

Captures are mandatory. After any capture, if the same piece can capture again, you must continue with that same piece.

Promotion occurs when a man reaches the farthest rank.

Kings move and capture diagonally across multiple squares (with the chosen landing rule).

Enjoy the game—and feel free to extend it!
