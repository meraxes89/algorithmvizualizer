import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box, Camera, Video } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PathFinding3DVisualizer = ({ grid = [] }) => {
  const { isDark } = useTheme();
  const [isFPV, setIsFPV] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const curveRef = useRef(null);
  const fpvProgressRef = useRef(0);
  const lookTargetRef = useRef(new THREE.Vector3());

  // Persistent Mesh Refs for high performance updates
  const meshesRef = useRef({
    wall: null,
    visited: null,
    path: null,
    ground: null,
  });

  // ── Reconstruct ordered path via previousNode chain & build Catmull-Rom Spline
  useEffect(() => {
    if (!grid || grid.length === 0) return;
    const numRows = grid.length;
    const numCols = grid[0].length;
    const tileSize = 0.9;
    const startX = -((numCols * tileSize) / 2) + tileSize / 2;
    const startZ = -((numRows * tileSize) / 2) + tileSize / 2;

    // Find start and end nodes
    let startNode = null;
    let endNode = null;
    for (let r = 0; r < numRows && (!startNode || !endNode); r++) {
      for (let c = 0; c < numCols && (!startNode || !endNode); c++) {
        if (grid[r][c].isStart) startNode = grid[r][c];
        if (grid[r][c].isEnd) endNode = grid[r][c];
      }
    }

    // Trace backwards from end using previousNode pointers (set by pathfinding algos)
    const orderedPath = [];
    if (endNode && endNode.previousNode) {
      let cur = endNode;
      while (cur) {
        orderedPath.unshift(cur);
        cur = cur.previousNode;
      }
    }

    // Fallback: walk path tiles from start if previousNode chain is broken
    if (orderedPath.length < 2 && startNode) {
      const visited = new Set();
      const queue = [startNode];
      visited.add(`${startNode.row},${startNode.col}`);
      const parentMap = new Map();

      while (queue.length > 0) {
        const cur = queue.shift();
        if (cur.isEnd) {
          // Trace back
          let n = cur;
          while (n) {
            orderedPath.unshift(n);
            n = parentMap.get(`${n.row},${n.col}`) || null;
          }
          break;
        }
        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const nr = cur.row + dr;
          const nc = cur.col + dc;
          const key = `${nr},${nc}`;
          if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols && !visited.has(key)) {
            const nb = grid[nr][nc];
            if (nb.isPath || nb.isEnd || nb.isStart) {
              visited.add(key);
              parentMap.set(key, cur);
              queue.push(nb);
            }
          }
        }
      }
    }

    // Final fallback: collect visited nodes in scan order for a flyover
    if (orderedPath.length < 2) {
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const node = grid[r][c];
          if (node.isVisited || node.isPath || node.isStart || node.isEnd) {
            orderedPath.push(node);
          }
        }
      }
    }

    // Build smooth 3D Catmull-Rom Spline Curve from ordered path
    if (orderedPath.length >= 2) {
      const pts = orderedPath.map(node => {
        const posX = startX + node.col * tileSize;
        const posZ = startZ + node.row * tileSize;
        return new THREE.Vector3(posX, 2.5, posZ);
      });
      curveRef.current = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
    } else {
      // Perimeter orbit fallback
      const hw = (numCols * tileSize) / 2;
      const hh = (numRows * tileSize) / 2;
      curveRef.current = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-hw, 3, -hh),
        new THREE.Vector3(hw, 3, -hh),
        new THREE.Vector3(hw, 3, hh),
        new THREE.Vector3(-hw, 3, hh),
      ], true, 'catmullrom');
    }

    fpvProgressRef.current = 0;
  }, [grid]);

  // ── Scene, Renderer, Camera, Lights & Mesh Pre-allocation (Runs Once)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0f172a : 0xf8fafc);
    if (isDark) {
      scene.fog = new THREE.FogExp2(0x0f172a, 0.012);
    }
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 500);
    camera.position.set(0, 32, 44);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer — PERFORMANCE OPTIMIZED
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    // OPTIMIZATION: Cap Pixel Ratio to 1.5 to save huge GPU overhead on mobile/retina displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    // OPTIMIZATION: Harder shadows are cheaper to compute than PCFSoft
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.0 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.3);
    dirLight.position.set(25, 50, 25);
    dirLight.castShadow = true;
    // OPTIMIZATION: Lower shadow map resolution (was 2048)
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0x38bdf8 : 0x87ceeb,
      isDark ? 0x1e293b : 0x444444,
      0.6
    );
    scene.add(hemiLight);

    // 5. Grid Helper
    const gridHelper = new THREE.GridHelper(
      60, 30,
      isDark ? 0x334155 : 0xcbd5e1,
      isDark ? 0x1e293b : 0xe2e8f0
    );
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 6. Pre-allocate Instanced Meshes for MAX PERFORMANCE (No more garbage collection spikes)
    // Allocate enough instances for any typical grid size (e.g., 20x50 = 1000, 30x70 = 2100)
    const maxInstances = grid.length > 0 && grid[0].length > 0 ? grid.length * grid[0].length + 100 : 3500;
    
    const tileSize = 0.9;
    const boxGeo = new THREE.BoxGeometry(tileSize * 0.88, 1, tileSize * 0.88);

    // OPTIMIZED Materials
    // Downgraded physical glass to standard transparent to avoid heavy transmission shading logic
    const glassMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x94a3b8 : 0xcbd5e1,
      transparent: true,
      opacity: 0.35, // Still frosted glass look, but 10x cheaper to render
      roughness: 0.2,
      metalness: 0.1,
      depthWrite: false,
      // Default side is FrontSide, halving triangle count compared to DoubleSide
    });

    const visitedMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x38bdf8 : 0x06b6d4,
      emissive: isDark ? 0x0ea5e9 : 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.2,
    });

    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.3,
    });

    const groundMat = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.2,
    });

    // Create instanced meshes
    const wallMesh = new THREE.InstancedMesh(boxGeo, glassMat, maxInstances);
    wallMesh.renderOrder = 10;
    
    const visitedMesh = new THREE.InstancedMesh(boxGeo, visitedMat, maxInstances);
    visitedMesh.renderOrder = 1;

    const pathMesh = new THREE.InstancedMesh(boxGeo, pathMat, maxInstances);
    pathMesh.renderOrder = 1;

    const groundMesh = new THREE.InstancedMesh(boxGeo, groundMat, maxInstances);
    groundMesh.renderOrder = 0;

    [wallMesh, visitedMesh, pathMesh, groundMesh].forEach(m => {
      m.castShadow = true;
      m.receiveShadow = true;
      m.count = 0; // Initialize with 0 count so they don't render until updated
      scene.add(m);
    });

    meshesRef.current = { wall: wallMesh, visited: visitedMesh, path: pathMesh, ground: groundMesh };

    // 7. Animation Loop
    let animationFrameId;
    const lookTarget = lookTargetRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!cameraRef.current) return;

      if (isFPV && curveRef.current) {
        const curve = curveRef.current;
        fpvProgressRef.current += 0.0012;
        if (fpvProgressRef.current >= 1.0) fpvProgressRef.current = 0.0;

        const t = fpvProgressRef.current;
        const pos = curve.getPointAt(t);

        // Smooth look-ahead — 8% ahead on the spline
        const lookT = Math.min(0.999, t + 0.08);
        const lookPos = curve.getPointAt(lookT);

        // Smooth dampened camera position
        cameraRef.current.position.lerp(pos, 0.08);

        // Smooth look target interpolation (no snapping)
        lookTarget.lerp(new THREE.Vector3(lookPos.x, 1.6, lookPos.z), 0.06);
        cameraRef.current.lookAt(lookTarget);

        // Smooth drone banking roll
        const tangent = curve.getTangentAt(t);
        const nextTangent = curve.getTangentAt(Math.min(0.999, t + 0.015));
        const curvature = tangent.x * nextTangent.z - tangent.z * nextTangent.x;
        const targetRoll = THREE.MathUtils.clamp(-curvature * 1.8, -0.35, 0.35);
        cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, targetRoll, 0.05);

      } else {
        // Orbit Overview Camera
        if (cameraRef.current.rotation.z !== 0) {
          cameraRef.current.rotation.z *= 0.9;
          if (Math.abs(cameraRef.current.rotation.z) < 0.001) cameraRef.current.rotation.z = 0;
        }
        const time = Date.now() * 0.00006;
        const radius = 46;
        cameraRef.current.position.x = Math.sin(time) * radius;
        cameraRef.current.position.y = 30;
        cameraRef.current.position.z = Math.cos(time) * radius + 4;
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Memory cleanup
      boxGeo.dispose();
      glassMat.dispose();
      visitedMat.dispose();
      pathMat.dispose();
      groundMat.dispose();
    };
  }, [isDark, isFPV, grid.length]); 

  // ── Fast Data Update: Update Matrices & Colors instead of re-creating meshes
  useEffect(() => {
    if (!grid || grid.length === 0 || !meshesRef.current.wall) return;

    const numRows = grid.length;
    const numCols = grid[0].length;
    const tileSize = 0.9;
    const startX = -((numCols * tileSize) / 2) + tileSize / 2;
    const startZ = -((numRows * tileSize) / 2) + tileSize / 2;

    const { wall, visited, path, ground } = meshesRef.current;
    
    // Reset instance counters for this frame update
    let wI = 0, vI = 0, pI = 0, gI = 0;
    
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const node = grid[r][c];
        const posX = startX + c * tileSize;
        const posZ = startZ + r * tileSize;

        if (node.isWall) {
          const h = 2.0 + ((r * 13 + c * 37) % 5) * 0.6;
          dummy.position.set(posX, h / 2, posZ);
          dummy.scale.set(1, h, 1);
          dummy.updateMatrix();
          wall.setMatrixAt(wI, dummy.matrix);
          col.setHex(isDark ? 0x94a3b8 : 0xcbd5e1);
          wall.setColorAt(wI, col);
          wI++;
        } else if (node.isStart) {
          dummy.position.set(posX, 2.0, posZ);
          dummy.scale.set(1, 4.0, 1);
          dummy.updateMatrix();
          path.setMatrixAt(pI, dummy.matrix);
          col.setHex(0x10b981);
          path.setColorAt(pI, col);
          pI++;
        } else if (node.isEnd) {
          dummy.position.set(posX, 2.0, posZ);
          dummy.scale.set(1, 4.0, 1);
          dummy.updateMatrix();
          path.setMatrixAt(pI, dummy.matrix);
          col.setHex(0xf43f5e);
          path.setColorAt(pI, col);
          pI++;
        } else if (node.isPath) {
          dummy.position.set(posX, 1.1, posZ);
          dummy.scale.set(1, 2.2, 1);
          dummy.updateMatrix();
          path.setMatrixAt(pI, dummy.matrix);
          col.setHex(0xfbbf24);
          path.setColorAt(pI, col);
          pI++;
        } else if (node.isVisited) {
          dummy.position.set(posX, 0.75, posZ);
          dummy.scale.set(1, 1.5, 1);
          dummy.updateMatrix();
          visited.setMatrixAt(vI, dummy.matrix);
          col.setHex(isDark ? 0x38bdf8 : 0x06b6d4);
          visited.setColorAt(vI, col);
          vI++;
        } else {
          dummy.position.set(posX, 0.025, posZ);
          dummy.scale.set(1, 0.05, 1);
          dummy.updateMatrix();
          ground.setMatrixAt(gI, dummy.matrix);
          col.setHex(isDark ? 0x1e293b : 0xf1f5f9);
          ground.setColorAt(gI, col);
          gI++;
        }
      }
    }

    // Update draw counts and flag for GPU upload
    wall.count = wI;
    visited.count = vI;
    path.count = pI;
    ground.count = gI;

    wall.instanceMatrix.needsUpdate = true;
    if (wall.instanceColor) wall.instanceColor.needsUpdate = true;
    
    visited.instanceMatrix.needsUpdate = true;
    if (visited.instanceColor) visited.instanceColor.needsUpdate = true;
    
    path.instanceMatrix.needsUpdate = true;
    if (path.instanceColor) path.instanceColor.needsUpdate = true;
    
    ground.instanceMatrix.needsUpdate = true;
    if (ground.instanceColor) ground.instanceColor.needsUpdate = true;

  }, [grid, isDark]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors duration-200">
      {/* Overlay Badge & FPV Drone Switch */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
          <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
          <span>3D Glassmorphic City Render (Ultra-Smooth)</span>
        </div>

        <button
          onClick={() => setIsFPV(!isFPV)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
            isFPV
              ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30 animate-pulse'
              : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {isFPV ? <Video className="w-3.5 h-3.5 text-white" /> : <Camera className="w-3.5 h-3.5 text-rose-500" />}
          <span>{isFPV ? 'FPV Drone Active' : 'FPV Drone Cam'}</span>
        </button>
      </div>

      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default PathFinding3DVisualizer;
