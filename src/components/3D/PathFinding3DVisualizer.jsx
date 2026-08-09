import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box, Camera, Video, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PathFinding3DVisualizer = ({ grid = [] }) => {
  const { isDark } = useTheme();
  const [isFPV, setIsFPV] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.85);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.15);
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 18, 16);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };
  const lookTargetRef = useRef(new THREE.Vector3());

  // FPV State Tracking
  const fpvStateRef = useRef({
    headPos: new THREE.Vector3(),
  });

  // Persistent Mesh Refs
  const meshesRef = useRef({
    wall: null,
    visited: null,
    path: null,
    ground: null,
  });

  // ── Cinematic Helicopter Tracking Logic
  useEffect(() => {
    if (!grid || grid.length === 0) return;
    const numRows = grid.length;
    const numCols = grid[0].length;
    const tileSize = 0.9;
    const startX = -((numCols * tileSize) / 2) + tileSize / 2;
    const startZ = -((numRows * tileSize) / 2) + tileSize / 2;

    let startNode = null;
    let endNode = null;
    const visitedNodes = [];

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const n = grid[r][c];
        if (n.isStart) startNode = n;
        if (n.isEnd) endNode = n;
        if (n.isVisited || n.isPath) visitedNodes.push(n);
      }
    }

    if (!startNode) return;

    // Track the "Search Head" (Helicopter Mode only)
    let head = startNode;
    if (visitedNodes.length > 0) {
      let minDist = Infinity;
      for (const vn of visitedNodes) {
        if (!endNode) break;
        const d = Math.abs(vn.row - endNode.row) + Math.abs(vn.col - endNode.col);
        if (d < minDist) {
          minDist = d;
          head = vn;
        }
      }
    }
    
    fpvStateRef.current.headPos.set(
      startX + head.col * tileSize,
      0, 
      startZ + head.row * tileSize
    );
  }, [grid]);

  // ── Scene, Renderer, Camera, Lights & Mesh Pre-allocation (Runs Once)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x000000 : 0xf8fafc);
    if (isDark) scene.fog = new THREE.FogExp2(0x000000, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 500);
    camera.position.set(0, 32, 44);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.0 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.3);
    dirLight.position.set(25, 50, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0x38bdf8 : 0x87ceeb,
      isDark ? 0x1e293b : 0x444444,
      0.6
    );
    scene.add(hemiLight);

    const gridHelper = new THREE.GridHelper(
      60, 30,
      isDark ? 0x334155 : 0xcbd5e1,
      isDark ? 0x1e293b : 0xe2e8f0
    );
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const maxInstances = grid.length > 0 && grid[0].length > 0 ? grid.length * grid[0].length + 100 : 3500;
    
    const tileSize = 0.9;
    const boxGeo = new THREE.BoxGeometry(tileSize * 0.88, 1, tileSize * 0.88);

    const glassMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x94a3b8 : 0xcbd5e1,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.1,
      depthWrite: false,
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
      m.frustumCulled = false; // CRITICAL FIX: prevents whole city from disappearing in FPV!
      m.count = 0; 
      scene.add(m);
    });

    meshesRef.current = { wall: wallMesh, visited: visitedMesh, path: pathMesh, ground: groundMesh };

    // Animation Loop
    let animationFrameId;
    const lookTarget = lookTargetRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!cameraRef.current) return;

      if (isFPV) {
        const fpv = fpvStateRef.current;
        
        // Helicopter Mode (Hovering & Tracking active search wave)
        const targetCamPos = new THREE.Vector3(
          fpv.headPos.x,
          20, // Hover height
          fpv.headPos.z + 16 // Offset slightly back
        );
        cameraRef.current.position.lerp(targetCamPos, 0.03); // Smooth slow chase
        
        lookTarget.lerp(fpv.headPos, 0.05);
        cameraRef.current.lookAt(lookTarget);
        
        // Reset roll
        cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, 0, 0.1);
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
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-black shadow-sm transition-colors duration-200">
      {/* Overlay Badge & FPV Drone Switch */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-110px)]">
        <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/80 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm truncate">
          <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">3D Glassmorphic City Render</span>
          <span className="sm:hidden">3D Render</span>
        </div>

        <button
          onClick={() => setIsFPV(!isFPV)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border shadow-sm shrink-0 ${
            isFPV
              ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30 animate-pulse'
              : 'bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          {isFPV ? <Video className="w-3.5 h-3.5 text-white" /> : <Camera className="w-3.5 h-3.5 text-rose-500" />}
          <span>{isFPV ? 'FPV Active' : 'FPV Cam'}</span>
        </button>
      </div>

      {/* Floating 3D Zoom Controls Widget */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/80 p-1 rounded-xl shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          title="3D Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          title="3D Zoom Out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          title="Reset 3D Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default PathFinding3DVisualizer;
