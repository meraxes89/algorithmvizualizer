import React, { useRef } from 'react';

const SpotlightCard = ({ children, className = '', as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });

  const apply = () => {
    rafRef.current = 0;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--sx', `${posRef.current.x}px`);
    el.style.setProperty('--sy', `${posRef.current.y}px`);
  };

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    posRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) {
      el.style.removeProperty('--sx');
      el.style.removeProperty('--sy');
    }
  };

  return (
    <Tag
      ref={ref}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
      <div className="spotlight-overlay" aria-hidden="true" />
    </Tag>
  );
};

export default React.memo(SpotlightCard);
