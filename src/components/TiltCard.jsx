import React, { useEffect, useRef } from 'react';

const TiltCard = ({ children, className = '', breathingDelay = 0 }) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafId = useRef(null);
  const deviceState = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const isHovered = useRef(false);

  // Extremely fast, un-react-bound DOM update for buttery 90-120fps on mobile/desktop
  const updateTransform = (rotateX, rotateY, glareX, glareY, glareOpacity, scale = 1) => {
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = glareOpacity.toString();
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`;
    }
  };

  // MOUSE (DESKTOP)
  const handleMouseMove = (e) => {
    if (!cardRef.current || window.matchMedia('(hover: none)').matches) return; // Skip if on touch device
    isHovered.current = true;
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
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
    if (window.matchMedia('(hover: none)').matches) return;
    isHovered.current = false;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    rafId.current = requestAnimationFrame(() => {
      updateTransform(0, 0, 50, 50, 0, 1);
    });
  };

  // GYROSCOPE (MOBILE DEVICE ORIENTATION)
  useEffect(() => {
    // Only bind device orientation if the device supports touch (likely a mobile device)
    if (!window.matchMedia('(hover: none)').matches) return;

    const handleOrientation = (e) => {
      if (!e.beta || !e.gamma) return;
      
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      rafId.current = requestAnimationFrame(() => {
        // Neutral holding position is roughly beta = 45 degrees, gamma = 0
        // We calculate delta from a neutral hold
        const beta = e.beta; // Front to back (-180 to 180)
        const gamma = e.gamma; // Left to right (-90 to 90)
        
        // Clamp and map degrees to subtle tilt (-10deg to +10deg max)
        // Adjust these dividers to change sensitivity
        let rotateX = (beta - 45) / 3;
        let rotateY = gamma / 3;

        rotateX = Math.max(-10, Math.min(10, rotateX));
        rotateY = Math.max(-10, Math.min(10, rotateY));

        // Map glare based on tilt
        const glareX = 50 + (rotateY * 3);
        const glareY = 50 - (rotateX * 3);
        const glareOpacity = (Math.abs(rotateX) + Math.abs(rotateY)) / 40; // Max opacity around 0.5
        
        updateTransform(rotateX, rotateY, glareX, glareY, Math.min(glareOpacity, 0.3), 1);
      });
    };

    // Request permissions for iOS 13+ devices
    const requestDeviceMotion = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
          }
        } catch (error) {
          console.error(error);
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      }
    };

    requestDeviceMotion();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div 
      className={`animate-breathe relative ${className}`}
      style={{ '--breathe-duration': `${6 + breathingDelay}s`, animationDelay: `${breathingDelay}s` }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform'
        }}
        className="relative w-full h-full rounded-[inherit] overflow-hidden"
      >
        {/* The Animated Conic Mesh Border sits behind the card content */}
        <div className="premium-border-mesh opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative w-full h-full z-10 rounded-[inherit] bg-transparent">
          {children}
        </div>
        
        {/* Hardware Accelerated Glare */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 mix-blend-overlay"
          style={{
            opacity: 0,
            transition: 'opacity 0.2s ease-out',
            willChange: 'opacity, background'
          }}
        />
      </div>
    </div>
  );
};

export default TiltCard;
