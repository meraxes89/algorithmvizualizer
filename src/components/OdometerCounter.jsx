import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OdometerCounter = ({ value = 0, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const digits = String(displayValue).split('');

  return (
    <span className={`inline-flex items-center overflow-hidden font-mono font-bold ${className}`}>
      <AnimatePresence mode="popLayout">
        {digits.map((digit, idx) => (
          <motion.span
            key={`${idx}-${digit}`}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-block"
          >
            {digit}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
};

export default OdometerCounter;
