import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

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
          className="fixed inset-0 z-[10000] pointer-events-none bg-black overflow-hidden flex"
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="text-emerald-500 font-mono text-sm leading-4 opacity-80"
              style={{
                marginLeft: `${(i % 5) * 0.4}%`,
                writingMode: 'vertical-rl',
                textOrientation: 'upright'
              }}
              initial={{ y: -1000 }}
              animate={{ y: '100vh' }}
              transition={{
                duration: (i % 3) + 2,
                repeat: Infinity,
                ease: "linear",
                delay: (i % 4) * 0.5
              }}
            >
              {Array.from({ length: 40 }).map((_, j) => (
                <span key={j} style={{ opacity: (i + j) % 5 === 0 ? 1 : 0.4 }}>
                  {String.fromCharCode(0x30A0 + ((i + j) % 96))}
                </span>
              ))}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default EasterEgg;
