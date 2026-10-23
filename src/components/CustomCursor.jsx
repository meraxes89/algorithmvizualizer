import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [cursorVariant, setCursorVariant] = useState('default');
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring config for smooth follow
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop
    if (window.matchMedia('(hover: none)').matches) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const tagName = target.tagName ? target.tagName.toLowerCase() : '';
      if (
        tagName === 'button' ||
        tagName === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.hasAttribute('data-cursor-pointer')
      ) {
        setCursorVariant('pointer');
      } else if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        target.closest('.monaco-editor')
      ) {
        setCursorVariant('text');
      } else {
        setCursorVariant('default');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: 'var(--accent-indigo)',
      border: '0px solid transparent',
      borderRadius: '50%',
      x: '-50%',
      y: '-50%',
      opacity: 0.8,
    },
    pointer: {
      width: 40,
      height: 40,
      backgroundColor: 'transparent',
      border: '2px solid var(--accent-indigo)',
      borderRadius: '50%',
      x: '-50%',
      y: '-50%',
      opacity: 1,
    },
    text: {
      width: 2,
      height: 24,
      backgroundColor: 'var(--accent-indigo)',
      border: '0px solid transparent',
      borderRadius: '2px',
      x: '-50%',
      y: '-50%',
      opacity: 0.9,
    },
  };

  if (window.matchMedia('(hover: none)').matches) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999]"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
    >
      <motion.div
        variants={variants}
        animate={cursorVariant}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      />
    </motion.div>
  );
};

export default CustomCursor;
