// HTML5 Canvas 2D Engine with Dirty-Rect Double Buffering for Pathfinding Grid
// Replaces 960+ React DOM div elements with 1 single canvas draw pass (60-120 FPS)

export const BIT_WALL = 1;
export const BIT_VISITED = 2;
export const BIT_PATH = 4;
export const BIT_START = 8;
export const BIT_END = 16;

const COLORS_LIGHT = {
  bg: '#f8fafc',
  gridLine: 'rgba(226, 232, 240, 0.6)',
  wall: '#1e293b',
  visited: 'rgba(99, 102, 241, 0.65)',
  path: '#f59e0b',
  start: '#10b981',
  end: '#f43f5e',
};

const COLORS_DARK = {
  bg: '#090d16',
  gridLine: 'rgba(30, 41, 59, 0.5)',
  wall: '#f8fafc',
  visited: 'rgba(99, 102, 241, 0.75)',
  path: '#fbbf24',
  start: '#10b981',
  end: '#f43f5e',
};

export class GridCanvasRenderer {
  constructor(canvas, rows = 20, cols = 48) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.rows = rows;
    this.cols = cols;
    this.isDark = false;
    
    this.cellWidth = 0;
    this.cellHeight = 0;
    
    this.gridState = new Uint8Array(rows * cols);
    this.prevState = new Uint8Array(rows * cols);
    this.prevState.fill(255); // Force full initial draw

    this.resize();
  }

  setTheme(isDark) {
    if (this.isDark !== isDark) {
      this.isDark = isDark;
      this.prevState.fill(255); // Force full repaint on theme change
      this.drawFull();
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.cellWidth = rect.width / this.cols;
    this.cellHeight = rect.height / this.rows;

    this.prevState.fill(255);
    this.drawFull();
  }

  getNodeIndex(row, col) {
    return row * this.cols + col;
  }

  setCellState(row, col, bitFlag) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    const idx = this.getNodeIndex(row, col);
    this.gridState[idx] = bitFlag;
  }

  updateFromReactGrid(grid) {
    if (!grid || grid.length === 0) return;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const node = grid[r][c];
        if (!node) continue;
        
        let flag = 0;
        if (node.isStart) flag |= BIT_START;
        else if (node.isEnd) flag |= BIT_END;
        else if (node.isPath) flag |= BIT_PATH;
        else if (node.isVisited) flag |= BIT_VISITED;
        else if (node.isWall) flag |= BIT_WALL;

        this.gridState[this.getNodeIndex(r, c)] = flag;
      }
    }
    this.drawDirty();
  }

  getCellColor(flag) {
    const palette = this.isDark ? COLORS_DARK : COLORS_LIGHT;
    if (flag & BIT_START) return palette.start;
    if (flag & BIT_END) return palette.end;
    if (flag & BIT_PATH) return palette.path;
    if (flag & BIT_VISITED) return palette.visited;
    if (flag & BIT_WALL) return palette.wall;
    return palette.bg;
  }

  drawCell(row, col, flag) {
    const x = col * this.cellWidth;
    const y = row * this.cellHeight;
    const palette = this.isDark ? COLORS_DARK : COLORS_LIGHT;

    // Fill Cell
    this.ctx.fillStyle = this.getCellColor(flag);
    this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

    // Draw Subtle Grid Border
    this.ctx.strokeStyle = palette.gridLine;
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
  }

  drawDirty() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = this.getNodeIndex(r, c);
        const currFlag = this.gridState[idx];
        if (currFlag !== this.prevState[idx]) {
          this.drawCell(r, c, currFlag);
          this.prevState[idx] = currFlag;
        }
      }
    }
  }

  drawFull() {
    const palette = this.isDark ? COLORS_DARK : COLORS_LIGHT;
    const rect = this.canvas.getBoundingClientRect();
    
    this.ctx.fillStyle = palette.bg;
    this.ctx.fillRect(0, 0, rect.width, rect.height);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = this.getNodeIndex(r, c);
        const flag = this.gridState[idx];
        this.drawCell(r, c, flag);
        this.prevState[idx] = flag;
      }
    }
  }

  hitTest(clientX, clientY) {
    if (!this.canvas) return null;
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return null;

    const col = Math.floor(x / this.cellWidth);
    const row = Math.floor(y / this.cellHeight);

    return { row: Math.max(0, Math.min(this.rows - 1, row)), col: Math.max(0, Math.min(this.cols - 1, col)) };
  }
}
