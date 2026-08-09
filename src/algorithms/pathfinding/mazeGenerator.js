// Maze Generation Algorithms for Pathfinding Visualizer
// Generates complex, challenging, guaranteed-solvable mazes with winding corridors and dead-ends.

/**
 * Ensures Start and End are connected in grid. If blocked, carves a winding path.
 */
function ensureConnectivity(grid, startPos, endPos) {
  const numRows = grid.length;
  const numCols = grid[0].length;
  
  // BFS check
  const queue = [{ row: startPos.row, col: startPos.col }];
  const visited = new Set([`${startPos.row},${startPos.col}`]);
  let found = false;

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    if (row === endPos.row && col === endPos.col) {
      found = true;
      break;
    }

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      const key = `${nr},${nc}`;
      if (
        nr >= 0 && nr < numRows &&
        nc >= 0 && nc < numCols &&
        !grid[nr][nc].isWall &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push({ row: nr, col: nc });
      }
    }
  }

  // If connected, we are good
  if (found) return grid;

  // Otherwise, carve a winding connector path from Start to End
  let currR = startPos.row;
  let currC = startPos.col;
  const targetR = endPos.row;
  const targetC = endPos.col;

  while (currR !== targetR || currC !== targetC) {
    grid[currR][currC].isWall = false;
    
    // Choose step towards target with slight randomness
    const moves = [];
    if (currR < targetR) moves.push([1, 0]);
    if (currR > targetR) moves.push([-1, 0]);
    if (currC < targetC) moves.push([0, 1]);
    if (currC > targetC) moves.push([0, -1]);

    if (Math.random() < 0.3) {
      // Add random side turn
      const sideMoves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      const randomMove = sideMoves[Math.floor(Math.random() * sideMoves.length)];
      const nr = Math.max(0, Math.min(numRows - 1, currR + randomMove[0]));
      const nc = Math.max(0, Math.min(numCols - 1, currC + randomMove[1]));
      currR = nr;
      currC = nc;
    } else {
      const move = moves[Math.floor(Math.random() * moves.length)];
      currR += move[0];
      currC += move[1];
    }
  }
  grid[targetR][targetC].isWall = false;

  return grid;
}

/**
 * 1. Recursive Backtracking (DFS Winding Corridors) Maze Generator
 * Creates intricate, deep winding labyrinths with multiple dead ends.
 */
export function generateDFSBacktrackingMaze(baseGrid, startPos, endPos) {
  const numRows = baseGrid.length;
  const numCols = baseGrid[0].length;

  // Start with a clone of grid where all cells are walls
  const grid = baseGrid.map(row =>
    row.map(node => {
      const isStart = node.row === startPos.row && node.col === startPos.col;
      const isEnd = node.row === endPos.row && node.col === endPos.col;
      return {
        ...node,
        isWall: true,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
        isStart,
        isEnd
      };
    })
  );

  // DFS Maze Carving using odd coordinates
  const visited = Array.from({ length: numRows }, () => Array(numCols).fill(false));

  function getValidNeighbors(r, c) {
    const neighbors = [];
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < numRows - 1 && nc > 0 && nc < numCols - 1 && !visited[nr][nc]) {
        neighbors.push({ r: nr, c: nc, dr: dr / 2, dc: dc / 2 });
      }
    }
    return neighbors;
  }

  // Start carving from (1, 1)
  const stack = [{ r: 1, c: 1 }];
  visited[1][1] = true;
  grid[1][1].isWall = false;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getValidNeighbors(current.r, current.c);

    if (neighbors.length > 0) {
      // Pick random unvisited neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      const wallR = current.r + next.dr;
      const wallC = current.c + next.dc;

      grid[wallR][wallC].isWall = false;
      grid[next.r][next.c].isWall = false;
      visited[next.r][next.c] = true;

      stack.push({ r: next.r, c: next.c });
    } else {
      stack.pop();
    }
  }

  // Guarantee Start and End are clear
  grid[startPos.row][startPos.col].isWall = false;
  grid[endPos.row][endPos.col].isWall = false;

  // Clear 3x3 surrounding radius around Start and End to avoid instant wall trapping
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const sr = startPos.row + dr;
      const sc = startPos.col + dc;
      const er = endPos.row + dr;
      const ec = endPos.col + dc;
      if (sr >= 0 && sr < numRows && sc >= 0 && sc < numCols) grid[sr][sc].isWall = false;
      if (er >= 0 && er < numRows && ec >= 0 && ec < numCols) grid[er][ec].isWall = false;
    }
  }

  // Braiding: randomly open 12% of walls to introduce loops/multiple paths
  for (let r = 1; r < numRows - 1; r++) {
    for (let c = 1; c < numCols - 1; c++) {
      if (grid[r][c].isWall && Math.random() < 0.12) {
        // Only open wall if it separates two open passages
        const hPassage = !grid[r][c - 1].isWall && !grid[r][c + 1].isWall;
        const vPassage = !grid[r - 1][c].isWall && !grid[r + 1][c].isWall;
        if (hPassage || vPassage) {
          grid[r][c].isWall = false;
        }
      }
    }
  }

  return ensureConnectivity(grid, startPos, endPos);
}

/**
 * 2. Recursive Division Maze Generator
 * Creates clean, structured, chamber-like mazes with wall lines and passage openings.
 */
export function generateRecursiveDivisionMaze(baseGrid, startPos, endPos) {
  const numRows = baseGrid.length;
  const numCols = baseGrid[0].length;

  const grid = baseGrid.map(row =>
    row.map(node => ({
      ...node,
      isWall: false,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null,
    }))
  );

  // Outer border walls
  for (let r = 0; r < numRows; r++) {
    grid[r][0].isWall = true;
    grid[r][numCols - 1].isWall = true;
  }
  for (let c = 0; c < numCols; c++) {
    grid[0][c].isWall = true;
    grid[numRows - 1][c].isWall = true;
  }

  function addWall(rStart, rEnd, cStart, cEnd) {
    const width = cEnd - cStart;
    const height = rEnd - rStart;

    if (width <= 2 || height <= 2) return;

    const horizontal = height > width || (height === width && Math.random() < 0.5);

    if (horizontal) {
      // Pick an even row for the wall line
      const wallRowChoices = [];
      for (let r = rStart + 1; r < rEnd; r++) {
        if (r % 2 === 0) wallRowChoices.push(r);
      }
      if (wallRowChoices.length === 0) return;
      const wallRow = wallRowChoices[Math.floor(Math.random() * wallRowChoices.length)];

      // Pick an odd column for the gap
      const gapColChoices = [];
      for (let c = cStart; c <= cEnd; c++) {
        if (c % 2 !== 0) gapColChoices.push(c);
      }
      if (gapColChoices.length === 0) return;
      const gapCol = gapColChoices[Math.floor(Math.random() * gapColChoices.length)];

      for (let c = cStart; c <= cEnd; c++) {
        if (c !== gapCol) {
          const isStartOrEnd =
            (wallRow === startPos.row && c === startPos.col) ||
            (wallRow === endPos.row && c === endPos.col);
          if (!isStartOrEnd) {
            grid[wallRow][c].isWall = true;
          }
        }
      }

      addWall(rStart, wallRow - 1, cStart, cEnd);
      addWall(wallRow + 1, rEnd, cStart, cEnd);
    } else {
      // Pick an even column for the wall line
      const wallColChoices = [];
      for (let c = cStart + 1; c < cEnd; c++) {
        if (c % 2 === 0) wallColChoices.push(c);
      }
      if (wallColChoices.length === 0) return;
      const wallCol = wallColChoices[Math.floor(Math.random() * wallColChoices.length)];

      // Pick an odd row for the gap
      const gapRowChoices = [];
      for (let r = rStart; r <= rEnd; r++) {
        if (r % 2 !== 0) gapRowChoices.push(r);
      }
      if (gapRowChoices.length === 0) return;
      const gapRow = gapRowChoices[Math.floor(Math.random() * gapRowChoices.length)];

      for (let r = rStart; r <= rEnd; r++) {
        if (r !== gapRow) {
          const isStartOrEnd =
            (r === startPos.row && wallCol === startPos.col) ||
            (r === endPos.row && wallCol === endPos.col);
          if (!isStartOrEnd) {
            grid[r][wallCol].isWall = true;
          }
        }
      }

      addWall(rStart, rEnd, cStart, wallCol - 1);
      addWall(rStart, rEnd, wallCol + 1, cEnd);
    }
  }

  addWall(1, numRows - 2, 1, numCols - 2);

  // Keep Start and End positions clear
  grid[startPos.row][startPos.col].isWall = false;
  grid[endPos.row][endPos.col].isWall = false;

  // Clear adjacent cells to prevent immediate blockages
  const clearRadius = (pos) => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = pos.row + dr;
        const c = pos.col + dc;
        if (r > 0 && r < numRows - 1 && c > 0 && c < numCols - 1) {
          grid[r][c].isWall = false;
        }
      }
    }
  };
  clearRadius(startPos);
  clearRadius(endPos);

  return ensureConnectivity(grid, startPos, endPos);
}

/**
 * 3. Prim's Algorithm Labyrinth Generator
 * Produces organic, dense branching labyrinths with rich wall structures.
 */
export function generatePrimsMaze(baseGrid, startPos, endPos) {
  const numRows = baseGrid.length;
  const numCols = baseGrid[0].length;

  const grid = baseGrid.map(row =>
    row.map(node => ({
      ...node,
      isWall: true,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null,
    }))
  );

  const walls = [];

  function addCellWalls(r, c) {
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < numRows - 1 && nc > 0 && nc < numCols - 1 && grid[nr][nc].isWall) {
        walls.push({ r: nr, c: nc, fromR: r, fromC: c });
      }
    }
  }

  // Start Prim's from (1, 1)
  grid[1][1].isWall = false;
  addCellWalls(1, 1);

  while (walls.length > 0) {
    const randIdx = Math.floor(Math.random() * walls.length);
    const { r, c, fromR, fromC } = walls.splice(randIdx, 1)[0];

    if (grid[r][c].isWall) {
      grid[r][c].isWall = false;
      const wallR = (r + fromR) / 2;
      const wallC = (c + fromC) / 2;
      grid[wallR][wallC].isWall = false;

      addCellWalls(r, c);
    }
  }

  // Clear Start and End
  grid[startPos.row][startPos.col].isWall = false;
  grid[endPos.row][endPos.col].isWall = false;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const sr = startPos.row + dr;
      const sc = startPos.col + dc;
      const er = endPos.row + dr;
      const ec = endPos.col + dc;
      if (sr >= 0 && sr < numRows && sc >= 0 && sc < numCols) grid[sr][sc].isWall = false;
      if (er >= 0 && er < numRows && ec >= 0 && ec < numCols) grid[er][ec].isWall = false;
    }
  }

  // Open ~10% loops
  for (let r = 1; r < numRows - 1; r++) {
    for (let c = 1; c < numCols - 1; c++) {
      if (grid[r][c].isWall && Math.random() < 0.1) {
        grid[r][c].isWall = false;
      }
    }
  }

  return ensureConnectivity(grid, startPos, endPos);
}

/**
 * Primary Maze Generator Router
 * Returns a complex, guaranteed-solvable maze based on requested type or random selection.
 */
export function generateComplexMaze(baseGrid, startPos, endPos, mazeType = 'dfs') {
  if (mazeType === 'recursive_division') {
    return generateRecursiveDivisionMaze(baseGrid, startPos, endPos);
  }
  if (mazeType === 'prims') {
    return generatePrimsMaze(baseGrid, startPos, endPos);
  }
  // Default to DFS Backtracking Winding Corridors
  return generateDFSBacktrackingMaze(baseGrid, startPos, endPos);
}
