import React, { useEffect, useRef } from 'react';

const CARD_INNER_STYLE = {
  transformStyle: 'preserve-3d',
  transition: 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)',
  willChange: 'transform'
};

const GLARE_STYLE = {
  opacity: 0,
  transition: 'opacity 0.2s ease-out',
  willChange: 'opacity, background'
};

const TiltCard = React.memo(({ children, className = '' }) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafId = useRef(null);
  const boundsRef = useRef(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(hover: none)').matches;
  }, []);

  // Fast, un-react-bound DOM update
  const updateTransform = (rotateX, rotateY, glareX, glareY, glareOpacity, scale = 1) => {
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = glareOpacity.toString();
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`;
    }
  };

  const handleMouseEnter = () => {
    if (isTouchDevice.current || !cardRef.current) return;
    boundsRef.current = cardRef.current.getBoundingClientRect();
  };

  // MOUSE (DESKTOP)
  const handleMouseMove = (e) => {
    if (isTouchDevice.current || !cardRef.current) return;
    if (!boundsRef.current) {
      boundsRef.current = cardRef.current.getBoundingClientRect();
    }
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      if (!boundsRef.current) return;
      const rect = boundsRef.current;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      
      updateTransform(rotateX, rotateY, glareX, glareY, 0.15, 1.02);
    });
  };

  const handleMouseLeave = () => {
    if (isTouchDevice.current) return;
    boundsRef.current = null;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    rafId.current = requestAnimationFrame(() => {
      updateTransform(0, 0, 50, 50, 0, 1);
    });
  };

  // GYROSCOPE (MOBILE DEVICE ORIENTATION)
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return;

    let isMounted = true;

    const handleOrientation = (e) => {
      if (!isMounted || !e.beta || !e.gamma) return;
      
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      rafId.current = requestAnimationFrame(() => {
        const beta = e.beta;
        const gamma = e.gamma;
        
        let rotateX = (beta - 45) / 3;
        let rotateY = gamma / 3;

        rotateX = Math.max(-10, Math.min(10, rotateX));
        rotateY = Math.max(-10, Math.min(10, rotateY));

        const glareX = 50 + (rotateY * 3);
        const glareY = 50 - (rotateX * 3);
        const glareOpacity = (Math.abs(rotateX) + Math.abs(rotateY)) / 40;
        
        updateTransform(rotateX, rotateY, glareX, glareY, Math.min(glareOpacity, 0.3), 1);
      });
    };

    const requestDeviceMotion = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          if (permissionState === 'granted' && isMounted) {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
          }
        } catch (error) {
          if (isMounted) {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
          }
        }
      } else if (isMounted) {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      }
    };

    requestDeviceMotion();

    return () => {
      isMounted = false;
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={CARD_INNER_STYLE}
        className="relative w-full h-full rounded-[inherit] overflow-hidden"
      >
        <div className="premium-border-mesh opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative w-full h-full z-10 rounded-[inherit] bg-transparent">
          {children}
        </div>
        
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 mix-blend-overlay"
          style={GLARE_STYLE}
        />
      </div>
    </div>
  );
});

export default TiltCard;
