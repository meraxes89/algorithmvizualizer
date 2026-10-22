import type { BoardStep, BoardView } from '@core/steps';

/**
 * Build a board step.
 *
 * The helper keeps the object literal out of the ambiguous position
 * after `yield`.
 */
export const boardStep = (step: BoardStep): BoardStep => step;

// src/algorithms/recursion/gridEngine.js
// Trace generator for Grid-based backtracking algorithms.

function cloneBoard<T>(b: T[][]): T[][] {
  return b.map((row) => [...row]);
}

// --- N-Queens ---
export function* runNQueensTrace(n: number): Generator<BoardStep, void, undefined> {
  const stack: string[] = [];

  const viewFor = (active: [number, number] | null, maze?: number[][]): BoardView => ({
    board: board.map((row) => [...row]),
    stack: stack.map((name, index) => ({ name, depth: index })),
    active,
    ...(maze ? { maze: maze.map((row) => [...row]) } : {}),
    output: [],
  });
  const board: string[][] = Array.from({ length: n }, () => Array<string>(n).fill('.'));

  function isSafe(b: string[][], row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (b[i][col] === 'Q') return false;
      const rowDiff = row - i;
      if (col - rowDiff >= 0 && b[i][col - rowDiff] === 'Q') return false;
      if (col + rowDiff < n && b[i][col + rowDiff] === 'Q') return false;
    }
    return true;
  }

  function* recurse(row: number): Generator<BoardStep, boolean, undefined> {
    stack.push(`solve(${row})`);
    if (row === n) {
      yield boardStep({
        family: 'board',
        t: 'success',
        view: viewFor(null),

        message: 'All queens placed successfully!',
      });
      stack.pop();
      return true;
    }

    for (let col = 0; col < n; col++) {
      yield boardStep({
        family: 'board',
        t: 'try',
        view: viewFor(null),

        message: `Trying queen at row ${row}, col ${col}`,
      });

      if (isSafe(board, row, col)) {
        board[row][col] = 'Q';
        yield boardStep({
          family: 'board',
          t: 'place',
          view: viewFor(null),

          message: `Placed queen at row ${row}, col ${col}`,
        });

        if (yield* recurse(row + 1)) {
          stack.pop();
          return true;
        }

        board[row][col] = '.';
        yield boardStep({
          family: 'board',
          t: 'backtrack',
          view: viewFor(null),

          message: `Backtracking: removed queen from row ${row}, col ${col}`,
        });
      } else {
        yield boardStep({
          family: 'board',
          t: 'invalid',
          view: viewFor(null),

          message: `Position row ${row}, col ${col} is not safe`,
        });
      }
    }

    stack.pop();
    return false;
  }

  yield boardStep({
    family: 'board',
    t: 'start',
    view: viewFor(null),

    message: `Starting N-Queens for N=${n}`,
  });
  const solved = yield* recurse(0);
  if (!solved) {
    yield boardStep({
      family: 'board',
      t: 'fail',
      view: viewFor(null),

      message: 'No solution found',
    });
  }
  return;
}

// --- Sudoku Solver ---
export function* runSudokuTrace(initialBoard: string[][]): Generator<BoardStep, void, undefined> {
  const stack: string[] = [];

  const viewFor = (active: [number, number] | null, maze?: number[][]): BoardView => ({
    board: board.map((row) => [...row]),
    stack: stack.map((name, index) => ({ name, depth: index })),
    active,
    ...(maze ? { maze: maze.map((row) => [...row]) } : {}),
    output: [],
  });
  const board = cloneBoard(initialBoard);

  function isValid(b: string[][], r: number, c: number, num: number): boolean {
    const strNum = String(num);
    for (let i = 0; i < 9; i++) {
      if (b[r][i] === strNum && i !== c) return false;
      if (b[i][c] === strNum && i !== r) return false;
      const subR = 3 * Math.floor(r / 3) + Math.floor(i / 3);
      const subC = 3 * Math.floor(c / 3) + (i % 3);
      if (b[subR][subC] === strNum && (subR !== r || subC !== c)) return false;
    }
    return true;
  }

  function* recurse(): Generator<BoardStep, boolean, undefined> {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === '.') {
          stack.push(`solve(${r}, ${c})`);

          for (let num = 1; num <= 9; num++) {
            yield boardStep({
              family: 'board',
              t: 'try',
              view: viewFor([r, c]),
              row: r,
              col: c,
              message: `Trying ${num} at row ${r}, col ${c}`,
            });

            if (isValid(board, r, c, num)) {
              board[r][c] = String(num);
              yield boardStep({
                family: 'board',
                t: 'place',
                view: viewFor([r, c]),
                row: r,
                col: c,
                message: `Placed ${num} at row ${r}, col ${c}`,
              });

              if (yield* recurse()) return true;

              board[r][c] = '.';
              yield boardStep({
                family: 'board',
                t: 'backtrack',
                view: viewFor([r, c]),
                row: r,
                col: c,
                message: `Backtracking: removed ${num} from row ${r}, col ${c}`,
              });
            } else {
              yield boardStep({
                family: 'board',
                t: 'invalid',
                view: viewFor([r, c]),
                row: r,
                col: c,
                message: `${num} is invalid at row ${r}, col ${c}`,
              });
            }
          }
          stack.pop();
          return false;
        }
      }
    }
    return true; // Solved
  }

  yield boardStep({
    family: 'board',
    t: 'start',
    view: viewFor(null),

    message: 'Starting Sudoku Solver',
  });
  if (yield* recurse()) {
    yield boardStep({
      family: 'board',
      t: 'success',
      view: viewFor(null),

      message: 'Sudoku solved successfully!',
    });
  } else {
    yield boardStep({
      family: 'board',
      t: 'fail',
      view: viewFor(null),

      message: 'No solution exists',
    });
  }
  return;
}

// --- Rat in a Maze ---
export function* runRatInMazeTrace(maze: number[][]): Generator<BoardStep, void, undefined> {
  const n = maze.length;
  const stack: string[] = [];

  const viewFor = (active: [number, number] | null, maze?: number[][]): BoardView => ({
    board: board.map((row) => [...row]),
    stack: stack.map((name, index) => ({ name, depth: index })),
    active,
    ...(maze ? { maze: maze.map((row) => [...row]) } : {}),
    output: [],
  });
  const board = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));

  function isSafe(x: number, y: number): boolean {
    return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] === 1 && board[x][y] === 0;
  }

  const dx = [1, 0]; // Down, Right (simplified to standard 2-directions, can add Up/Left if needed)
  const dy = [0, 1];
  const moves = ['D', 'R'];

  function* recurse(x: number, y: number): Generator<BoardStep, boolean, undefined> {
    stack.push(`solve(${x}, ${y})`);

    if (x === n - 1 && y === n - 1) {
      board[x][y] = 1;
      yield boardStep({
        family: 'board',
        t: 'success',
        view: viewFor([x, y], maze),
        row: x,
        col: y,
        message: 'Rat reached the cheese!',
      });
      stack.pop();
      return true;
    }

    if (isSafe(x, y)) {
      board[x][y] = 1;
      yield boardStep({
        family: 'board',
        t: 'place',
        view: viewFor([x, y], maze),
        row: x,
        col: y,
        message: `Rat moved to row ${x}, col ${y}`,
      });

      for (let k = 0; k < 2; k++) {
        const nextX = x + dx[k];
        const nextY = y + dy[k];

        yield boardStep({
          family: 'board',
          t: 'try',
          view: viewFor([nextX, nextY], maze),
          row: nextX,
          col: nextY,
          message: `Rat trying to move ${moves[k]} to row ${nextX}, col ${nextY}`,
        });

        if (yield* recurse(nextX, nextY)) {
          stack.pop();
          return true;
        }
      }

      board[x][y] = 0;
      yield boardStep({
        family: 'board',
        t: 'backtrack',
        view: viewFor([x, y], maze),
        row: x,
        col: y,
        message: `Backtracking from row ${x}, col ${y}`,
      });
    } else {
      yield boardStep({
        family: 'board',
        t: 'invalid',
        view: viewFor([x, y], maze),
        row: x,
        col: y,
        message: `Position row ${x}, col ${y} is invalid or blocked`,
      });
    }

    stack.pop();
    return false;
  }

  yield boardStep({
    family: 'board',
    t: 'start',
    view: viewFor(null, maze),

    message: 'Rat starting at 0, 0',
  });
  if (!(yield* recurse(0, 0))) {
    yield boardStep({
      family: 'board',
      t: 'fail',
      view: viewFor(null, maze),

      message: 'No path found',
    });
  }
  return;
}

// --- Knight's Tour ---
export function* runKnightsTourTrace(n: number): Generator<BoardStep, void, undefined> {
  const stack: string[] = [];

  const viewFor = (active: [number, number] | null, maze?: number[][]): BoardView => ({
    board: board.map((row) => [...row]),
    stack: stack.map((name, index) => ({ name, depth: index })),
    active,
    ...(maze ? { maze: maze.map((row) => [...row]) } : {}),
    output: [],
  });
  const board: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(-1));

  const xMove = [2, 1, -1, -2, -2, -1, 1, 2];
  const yMove = [1, 2, 2, 1, -1, -2, -2, -1];

  function isSafe(x: number, y: number): boolean {
    return x >= 0 && x < n && y >= 0 && y < n && board[x][y] === -1;
  }

  function* recurse(x: number, y: number, movei: number): Generator<BoardStep, boolean, undefined> {
    stack.push(`move(${movei})`);

    if (movei === n * n) {
      yield boardStep({
        family: 'board',
        t: 'success',
        view: viewFor(null),

        message: "Knight's tour completed successfully!",
      });
      stack.pop();
      return true;
    }

    for (let k = 0; k < 8; k++) {
      const nextX = x + xMove[k];
      const nextY = y + yMove[k];

      yield boardStep({
        family: 'board',
        t: 'try',
        view: viewFor([nextX, nextY]),
        row: nextX,
        col: nextY,
        message: `Trying move ${movei} to row ${nextX}, col ${nextY}`,
      });

      if (isSafe(nextX, nextY)) {
        board[nextX][nextY] = movei;
        yield boardStep({
          family: 'board',
          t: 'place',
          view: viewFor([nextX, nextY]),
          row: nextX,
          col: nextY,
          message: `Knight moved to row ${nextX}, col ${nextY} (Step ${movei})`,
        });

        if (yield* recurse(nextX, nextY, movei + 1)) {
          stack.pop();
          return true;
        }

        board[nextX][nextY] = -1;
        yield boardStep({
          family: 'board',
          t: 'backtrack',
          view: viewFor([nextX, nextY]),
          row: nextX,
          col: nextY,
          message: `Backtracking: removed step ${movei} from row ${nextX}, col ${nextY}`,
        });
      } else {
        yield boardStep({
          family: 'board',
          t: 'invalid',
          view: viewFor([nextX, nextY]),
          row: nextX,
          col: nextY,
          message: `Move ${movei} to row ${nextX}, col ${nextY} is invalid`,
        });
      }
    }

    stack.pop();
    return false;
  }

  board[0][0] = 0;
  yield boardStep({
    family: 'board',
    t: 'start',
    view: viewFor(null),

    message: `Starting Knight's Tour for N=${n} at 0,0`,
  });
  if (!(yield* recurse(0, 0, 1))) {
    yield boardStep({
      family: 'board',
      t: 'fail',
      view: viewFor(null),

      message: 'No tour found',
    });
  }
  return;
}
