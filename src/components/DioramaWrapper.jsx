import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useScroll, useTransform, motion } from 'framer-motion';

const DIORAMA_STYLE = { willChange: 'transform' };

const DioramaWrapper = React.memo(({ children }) => {
  const wrapperRef = useRef(null);
  const location = useLocation();
  const rafId = useRef(null);

  // Z-Axis Parallax based on Scroll
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 300]);
  const foregroundY = useTransform(scrollY, [0, 1000], [0, -150]);

  useEffect(() => {
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;
    let isTouch = window.matchMedia('(hover: none)').matches;

    const handleResize = () => {
      winWidth = window.innerWidth;
      winHeight = window.innerHeight;
      isTouch = window.matchMedia('(hover: none)').matches;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const handleMouseMove = (e) => {
      if (!wrapperRef.current) return;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      const clientX = e.clientX;
      const clientY = e.clientY;

      rafId.current = requestAnimationFrame(() => {
        if (document.hidden) return;

        document.documentElement.style.setProperty('--mouse-x', `${clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${clientY}px`);

        if (!isTouch && wrapperRef.current) {
          const x = (clientX / winWidth - 0.5) * 2;
          const y = (clientY / winHeight - 0.5) * 2;
          const rotateX = y * -1.5; 
          const rotateY = x * 1.5;

          wrapperRef.current.style.transform = `perspective(2000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        }
      });
    };

    const handleMouseLeave = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg)';
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        document.documentElement.setAttribute('data-tab-hidden', '');
      } else {
        document.documentElement.removeAttribute('data-tab-hidden');
      }
    };

    if (document.hidden) handleVisibility();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Reset scroll and diorama on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg)';
    }
  }, [location.pathname]);

  return (
    <div className="w-full relative overflow-hidden preserve-3d" style={{ perspective: '2000px' }}>
      
      {/* Scroll-Parallax Ambient Background */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none z-[-1] translate-z-negative-100"
      >
        <div className="bg-ambient w-full h-full"></div>
      </motion.div>

      {/* Global Cursor Glow */}
      <div className="cursor-glow" />

      {/* Main Diorama Content */}
      <div 
        ref={wrapperRef}
        className="w-full min-h-screen transition-transform duration-200 ease-out preserve-3d"
        style={DIORAMA_STYLE}
      >
        <motion.div style={{ y: foregroundY }} className="w-full h-full preserve-3d">
          {children}
        </motion.div>
      </div>

    </div>
  );
});

export default DioramaWrapper;
