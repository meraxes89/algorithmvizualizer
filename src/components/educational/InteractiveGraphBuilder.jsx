import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, MousePointer2, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';

const InteractiveGraphBuilder = React.memo(({ onGraphChange, isOpen, initialGraph }) => {
  // Seed from the live graph so opening the builder shows the current
  // graph instead of an empty canvas.
  const [nodes, setNodes] = useState(() => initialGraph?.vertices ?? []);
  const [edges, setEdges] = useState(() => initialGraph?.edges ?? []);
  const [isDirected, setIsDirected] = useState(() => initialGraph?.isDirected ?? false);
  const [mode, setMode] = useState('select'); // select, addNode, addEdge, delete
  const [selectedNode, setSelectedNode] = useState(null);
  const [edgeStart, setEdgeStart] = useState(null);
  const [edgeWeight, setEdgeWeight] = useState(1);
  const svgRef = useRef(null);

  // Keep the latest callback in a ref so a new inline function identity on
  // every parent render cannot retrigger the effect below.
  const onGraphChangeRef = useRef(onGraphChange);
  useEffect(() => {
    onGraphChangeRef.current = onGraphChange;
  });

  // Snapshot of the graph the builder was opened with. Reporting only when
  // the graph actually diverges from it keeps the initial mount (and any
  // parent re-render) from wiping the live graph.
  const initialGraphRef = useRef({ nodes, edges, isDirected });

  useEffect(() => {
    const initial = initialGraphRef.current;
    if (initial.nodes === nodes && initial.edges === edges && initial.isDirected === isDirected) {
      return;
    }
    onGraphChangeRef.current?.({ vertices: nodes, edges, isDirected });
  }, [nodes, edges, isDirected]);

  const handleSvgClick = (e) => {
    if (mode === 'addNode' && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Mirror GraphVisualizer's id/label scheme so ids stay unique and
      // consistent when the builder starts from an existing graph.
      const maxId = nodes.reduce((max, n) => (n.id > max ? n.id : max), -1);
      const newId = maxId + 1;
      const newNode = {
        id: newId,
        label: String.fromCharCode(65 + (newId % 26)) + (newId >= 26 ? Math.floor(newId / 26) : ''),
        x,
        y,
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleNodeClick = (e, node) => {
    e.stopPropagation();

    if (mode === 'select') {
      setSelectedNode(node);
    } else if (mode === 'delete') {
      setNodes(nodes.filter(n => n.id !== node.id));
      setEdges(edges.filter(edge => edge.from !== node.id && edge.to !== node.id));
    } else if (mode === 'addEdge') {
      if (edgeStart === null) {
        setEdgeStart(node);
      } else if (edgeStart.id !== node.id) {
        const newEdge = {
          from: edgeStart.id,
          to: node.id,
          weight: edgeWeight,
        };
        // Check if edge already exists
        const edgeExists = edges.some(
          edge =>
            (edge.from === newEdge.from && edge.to === newEdge.to) ||
            (!isDirected && edge.from === newEdge.to && edge.to === newEdge.from)
        );
        if (!edgeExists) {
          setEdges([...edges, newEdge]);
        }
        setEdgeStart(null);
      }
    }
  };

  const handleNodeDrag = (e, node) => {
    if (mode !== 'select') return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(n => (n.id === node.id ? { ...n, x, y } : n)));
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setEdgeStart(null);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMode('select')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
              mode === 'select'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MousePointer2 size={18} />
            Select/Move
          </button>

          <button
            onClick={() => setMode('addNode')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
              mode === 'addNode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Plus size={18} />
            Add Node
          </button>

          <button
            onClick={() => setMode('addEdge')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
              mode === 'addEdge'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <ArrowRight size={18} />
            Add Edge
          </button>

          <button
            onClick={() => setMode('delete')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
              mode === 'delete'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Trash2 size={18} />
            Delete
          </button>

          <div className="h-8 w-px bg-gray-600 mx-2" />

          <button
            onClick={() => setIsDirected(!isDirected)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
              isDirected
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isDirected ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {isDirected ? 'Directed' : 'Undirected'}
          </button>

          {mode === 'addEdge' && (
            <div className="flex items-center gap-2 ml-4">
              <label className="text-white text-sm font-semibold">Weight:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          <button
            onClick={clearGraph}
            className="ml-auto flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Clear Graph
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-900" style={{ height: '400px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair"
          onClick={handleSvgClick}
        >
          {/* Edges */}
          {edges.map((edge, idx) => {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const nodeRadius = 25;
            const arrowOffset = isDirected ? 10 : 0;

            const x1 = from.x + (dx / distance) * nodeRadius;
            const y1 = from.y + (dy / distance) * nodeRadius;
            const x2 = to.x - (dx / distance) * (nodeRadius + arrowOffset);
            const y2 = to.y - (dy / distance) * (nodeRadius + arrowOffset);

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#60a5fa"
                  strokeWidth={2}
                  markerEnd={isDirected ? 'url(#arrow)' : undefined}
                />
                <rect
                  x={midX - 12}
                  y={midY - 10}
                  width={24}
                  height={20}
                  rx={4}
                  fill="#1f2937"
                  stroke="#4b5563"
                  strokeWidth={1}
                />
                <text
                  x={midX}
                  y={midY + 1}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Arrow Marker */}
          {isDirected && (
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#60a5fa" />
              </marker>
            </defs>
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <g
              key={node.id}
              onMouseDown={(e) => {
                if (mode === 'select') {
                  const handleMouseMove = (e) => handleNodeDrag(e, node);
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }
              }}
              onClick={(e) => handleNodeClick(e, node)}
              className="cursor-pointer"
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={25}
                fill={
                  selectedNode?.id === node.id
                    ? '#8b5cf6'
                    : edgeStart?.id === node.id
                    ? '#fbbf24'
                    : '#3b82f6'
                }
                stroke="white"
                strokeWidth={3}
                className="transition-all duration-200 hover:scale-110"
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              />
              <text
                x={node.x}
                y={node.y}
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-gray-800/90 px-4 py-2 rounded-lg text-sm text-gray-300">
          {mode === 'addNode' && 'Click anywhere to add a node'}
          {mode === 'addEdge' && edgeStart === null && 'Click first node to start edge'}
          {mode === 'addEdge' && edgeStart !== null && 'Click second node to complete edge'}
          {mode === 'delete' && 'Click a node or edge to delete it'}
          {mode === 'select' && 'Drag nodes to move them'}
        </div>
      </div>
    </div>
  );
});

export default InteractiveGraphBuilder;
