import React from 'react';

/**
 * GlassCard – a reusable container with glassmorphism style.
 * Provides a subtle backdrop blur, translucent background, and gentle hover lift.
 */
const GlassCard = React.memo(({ children, className = '' }) => {
  return (
    <div
      className={`glass-card ${className}`}
    >
      {children}
    </div>
  );
});

export default GlassCard;
