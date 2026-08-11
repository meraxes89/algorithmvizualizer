import React, { useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.1 };
const WHILE_TAP_CONFIG = { scale: 0.92, transition: { type: "spring", stiffness: 400, damping: 10 } };

const MagneticButton = React.memo(({ children, className = '' }) => {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Apply spring physics for elastic bounce
  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const innerX = useTransform(springX, (val) => val * 0.5);
  const innerY = useTransform(springY, (val) => val * 0.5);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Apply pull if hovered
    x.set((clientX - centerX) * 0.3);
    y.set((clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={WHILE_TAP_CONFIG}
    >
      <motion.div style={{ x: innerX, y: innerY }}>
        {children}
      </motion.div>
    </motion.div>
  );
});

export default MagneticButton;
