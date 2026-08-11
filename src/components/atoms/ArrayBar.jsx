import React from 'react';

const ArrayBar = React.memo(({ value, maxValue, isComparing, isSwapping, isSorted, isPivot, color, style }) => {
  const barStyle = style || {
    height: `${(value / (maxValue || 1)) * 100}%`,
    backgroundColor: color
  };

  return (
    <div
      style={barStyle}
      className={`transition-all duration-75 rounded-t-sm flex-1 ${
        isSwapping ? 'scale-105 z-10 shadow-lg' : ''
      }`}
    />
  );
});

export default ArrayBar;
