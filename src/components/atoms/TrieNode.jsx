import React from 'react';

const TrieNode = React.memo(({ x, y, char, isEndOfWord, isActive, isVisited, radius = 20 }) => {
  const transformStyle = { transformOrigin: `${x}px ${y}px` };

  let fillColor = '#3b82f6';
  if (isActive) fillColor = '#fbbf24';
  else if (isVisited) fillColor = '#10b981';

  return (
    <g className="transition-all duration-200">
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fillColor}
        stroke={isEndOfWord ? '#ef4444' : '#ffffff'}
        strokeWidth={isEndOfWord ? 3.5 : 2}
        className="transition-all duration-200"
        style={transformStyle}
      />
      <text
        x={x}
        y={y}
        fill="#ffffff"
        fontSize="13"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        className="select-none pointer-events-none"
      >
        {char || '*'}
      </text>
    </g>
  );
});

export default TrieNode;
