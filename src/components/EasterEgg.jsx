import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const MatrixCanvas = React.memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = new Float32Array(columns);

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

    let animId;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#10b981';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[10000] pointer-events-none w-full h-full"
    />
  );
});

const EasterEgg = React.memo(() => {
  const [matrixActive, setMatrixActive] = useState(false);
  const matrixActiveRef = useRef(false);
  matrixActiveRef.current = matrixActive;

  useEffect(() => {
    let inputSeq = [];

    const handleKeyDown = (e) => {
      const key = e.key;
      inputSeq = [...inputSeq, key].slice(-10);

      if (inputSeq.join('').toLowerCase() === KONAMI_CODE.join('').toLowerCase()) {
        if (!matrixActiveRef.current) {
          triggerMatrix();
        }
        inputSeq = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerMatrix = () => {
    setMatrixActive(true);
    setTimeout(() => {
      setMatrixActive(false);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {matrixActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] pointer-events-none bg-black overflow-hidden"
        >
          <MatrixCanvas />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default EasterEgg;
