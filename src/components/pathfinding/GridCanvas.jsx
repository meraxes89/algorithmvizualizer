import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const CELL = 20;

const PALETTE = {
  light: {
    background: '#FCFAF4',
    grid: 'rgba(33, 27, 20, 0.08)',
    wall: '#475569',
    visited: '#60A5FA',
    path: '#FACC15',
    start: '#10B981',
    end: '#F43F5E',
  },
  dark: {
    background: '#14110D',
    grid: 'rgba(241, 235, 223, 0.07)',
    wall: '#64748B',
    visited: '#3B82F6',
    path: '#EAB308',
    start: '#10B981',
    end: '#F43F5E',
  },
};

const GridCanvas = ({ grid, rows, cols, onCellDown, onCellEnter, onPointerUp }) => {
  const canvasRef = useRef(null);
  const lastCellRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = cols * CELL;
    const height = rows * CELL;
    const colors = isDark ? PALETTE.dark : PALETTE.light;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const node = grid[row]?.[col];
        if (!node) continue;
        const x = col * CELL;
        const y = row * CELL;

        if (node.isWall) {
          ctx.fillStyle = colors.wall;
          ctx.fillRect(x, y, CELL, CELL);
        } else if (node.isStart || node.isEnd) {
          ctx.fillStyle = node.isStart ? colors.start : colors.end;
          ctx.fillRect(x, y, CELL, CELL);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(x + CELL / 2, y + CELL / 2, CELL * 0.16, 0, Math.PI * 2);
          ctx.fill();
        } else if (node.isPath) {
          ctx.fillStyle = colors.path;
          ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        } else if (node.isVisited) {
          ctx.fillStyle = colors.visited;
          ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        }
      }
    }

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let col = 0; col <= cols; col++) {
      ctx.moveTo(col * CELL + 0.5, 0);
      ctx.lineTo(col * CELL + 0.5, height);
    }
    for (let row = 0; row <= rows; row++) {
      ctx.moveTo(0, row * CELL + 0.5);
      ctx.lineTo(width, row * CELL + 0.5);
    }
    ctx.stroke();
  }, [grid, rows, cols, isDark]);

  const cellFromEvent = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * cols);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * rows);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    const cell = cellFromEvent(event);
    if (!cell) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    lastCellRef.current = cell;
    onCellDown?.(cell.row, cell.col);
  };

  const handlePointerMove = (event) => {
    if (event.buttons !== 1) return;
    const cell = cellFromEvent(event);
    if (!cell) return;
    const last = lastCellRef.current;
    if (last && last.row === cell.row && last.col === cell.col) return;
    lastCellRef.current = cell;
    onCellEnter?.(cell.row, cell.col);
  };

  const handlePointerEnd = () => {
    lastCellRef.current = null;
    onPointerUp?.();
  };

  return (
    <canvas
      ref={canvasRef}
      className="block h-auto w-full touch-none rounded-xl"
      role="img"
      aria-label="Pathfinding grid. Drag to draw walls or move the start and end nodes."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    />
  );
};

export default GridCanvas;
