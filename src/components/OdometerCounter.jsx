import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIGIT_TRANSITION = { duration: 0.18, ease: 'easeOut' };

const OdometerCounter = React.memo(({ value = 0, className = '' }) => {
  const digits = useMemo(() => String(value).split(''), [value]);

  return (
    <span className={`inline-flex items-center overflow-hidden font-mono font-bold ${className}`}>
      <AnimatePresence mode="popLayout">
        {digits.map((digit, idx) => (
          <motion.span
            key={`${idx}-${digit}`}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={DIGIT_TRANSITION}
            className="inline-block"
          >
            {digit}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
});

export default OdometerCounter;
