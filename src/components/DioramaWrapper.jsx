import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useScroll, useTransform, motion } from 'framer-motion';

const DioramaWrapper = ({ children }) => {
  const wrapperRef = useRef(null);
  const location = useLocation();
  const rafId = useRef(null);

  // Z-Axis Parallax based on Scroll
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 300]);
  const foregroundY = useTransform(scrollY, [0, 1000], [0, -150]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!wrapperRef.current) return;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      rafId.current = requestAnimationFrame(() => {
        // Update CSS variables for Cursor Glow
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);

        // Only apply Diorama tilt on desktop
        if (!window.matchMedia('(hover: none)').matches) {
          // Calculate mouse position relative to center of screen (-1 to 1)
          const x = (e.clientX / window.innerWidth - 0.5) * 2;
          const y = (e.clientY / window.innerHeight - 0.5) * 2;
          
          // Very subtle tilt: Max 1.5 degrees
          const rotateX = y * -1.5; 
          const rotateY = x * 1.5;

          wrapperRef.current.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      });
    };

    const handleMouseLeave = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
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
        style={{ willChange: 'transform' }}
      >
        <motion.div style={{ y: foregroundY }} className="w-full h-full preserve-3d">
          {children}
        </motion.div>
      </div>

    </div>
  );
};

export default DioramaWrapper;
