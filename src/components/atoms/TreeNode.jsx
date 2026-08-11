import React from 'react';

const TreeNode = React.memo(({ x, y, value, isActive, isVisited, isDeleting, label, radius = 22, gradientId = 'tree-node-grad' }) => {
  const transformStyle = { transformOrigin: `${x}px ${y}px` };

  return (
    <g className="transition-all duration-300">
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={isActive ? '#8b5cf6' : isVisited ? '#10b981' : isDeleting ? '#ef4444' : `url(#${gradientId})`}
        stroke={isActive ? '#c4b5fd' : '#ffffff'}
        strokeWidth={2.5}
        className="transition-all duration-300"
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
        {value}
      </text>
      {label && (
        <text
          x={x}
          y={y + radius + 14}
          fill="#94a3b8"
          fontSize="10"
          fontWeight="semibold"
          textAnchor="middle"
          className="select-none pointer-events-none"
        >
          {label}
        </text>
      )}
    </g>
  );
});

export default TreeNode;
