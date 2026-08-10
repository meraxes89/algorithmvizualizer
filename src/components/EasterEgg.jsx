import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const EasterEgg = () => {
  const [inputSequence, setInputSequence] = useState([]);
  const [matrixActive, setMatrixActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      setInputSequence(prev => {
        const newSeq = [...prev, key].slice(-10);
        
        if (newSeq.join('').toLowerCase() === KONAMI_CODE.join('').toLowerCase()) {
          if (!matrixActive) triggerMatrix();
          return [];
        }
        return newSeq;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matrixActive]);

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
                marginLeft: `${Math.random() * 2}%`,
                writingMode: 'vertical-rl',
                textOrientation: 'upright'
              }}
              initial={{ y: -1000 }}
              animate={{ y: '100vh' }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2
              }}
            >
              {Array.from({ length: 40 }).map((_, j) => (
                <span key={j} style={{ opacity: Math.random() > 0.8 ? 1 : 0.4 }}>
                  {String.fromCharCode(0x30A0 + Math.random() * 96)}
                </span>
              ))}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EasterEgg;
