import React from 'react';

export const GraphEdge = React.memo(({ x1, y1, x2, y2, weight, isVisited, isActive, isDirected }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const strokeColor = isActive ? '#fbbf24' : isVisited ? '#10b981' : '#64748b';
  const strokeWidth = isActive ? 3.5 : isVisited ? 2.5 : 1.5;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={isDirected ? (isActive ? 'url(#arrow-active)' : 'url(#arrow-default)') : undefined}
        className="transition-all duration-200"
      />
      {weight !== undefined && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-12}
            y={-10}
            width={24}
            height={20}
            rx={4}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth={1}
          />
          <text
            x={0}
            y={1}
            fill="#e2e8f0"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {weight}
          </text>
        </g>
      )}
    </g>
  );
});

export const GraphNode = React.memo(({ id, label, x, y, isSelected, isActive, isVisited, onMouseDown, onClick }) => {
  const transformStyle = { transformOrigin: `${x}px ${y}px` };

  let fillColor = '#3b82f6';
  if (isSelected) fillColor = '#8b5cf6';
  else if (isActive) fillColor = '#fbbf24';
  else if (isVisited) fillColor = '#10b981';

  return (
    <g
      onMouseDown={onMouseDown}
      onClick={onClick}
      className="cursor-pointer"
    >
      <circle
        cx={x}
        cy={y}
        r={22}
        fill={fillColor}
        stroke="#ffffff"
        strokeWidth={2.5}
        className="transition-all duration-200 hover:scale-110"
        style={transformStyle}
      />
      <text
        x={x}
        y={y}
        fill="#ffffff"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        className="select-none pointer-events-none"
      >
        {label || id}
      </text>
    </g>
  );
});
