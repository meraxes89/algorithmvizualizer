import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box, Camera, Video, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PathFinding3DVisualizer = ({ grid = [] }) => {
  const { isDark } = useTheme();
  const [isFPV, setIsFPV] = useState(true);
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

  const fpvStateRef = useRef({
    headPos: new THREE.Vector3(),
    forwardPos: new THREE.Vector3(),
    isPathAnimating: false,
    activePathNodes: [],
    targetProgress: 0,
    smoothProgress: 0,
    isFullyDrawn: false,
    startX: 0,
    startZ: 0,
    tileSize: 0.9,
  });
  const wasPathFoundRef = useRef(false);

  // Persistent Mesh Refs
  const meshesRef = useRef({
    wall: null,
    visited: null,
    path: null,
    ground: null,
  });

  // ── Cinematic FPV Drone Flight Logic
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
    const pathNodesRaw = [];

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const n = grid[r][c];
        if (n.isStart) startNode = n;
        if (n.isEnd) endNode = n;
        if (n.isPath) pathNodesRaw.push(n);
        if (n.isVisited) visitedNodes.push(n);
      }
    }

    if (!startNode) return;

    // Path Found Phase: Synchronize helicopter flight perfectly with the yellow path drawing
    if (endNode && pathNodesRaw.length > 0) {
      const orderedPath = [];
      let curr = endNode;
      const visitedSet = new Set();
      
      while (curr && !visitedSet.has(curr)) {
        visitedSet.add(curr);
        orderedPath.unshift(curr);
        if (curr === startNode || curr.isStart) break;
        curr = curr.previousNode;
      }

      const activePathNodes = orderedPath.length > 1 ? orderedPath : [startNode, ...pathNodesRaw, endNode];
      fpvStateRef.current.activePathNodes = activePathNodes;
      
      const isFullyDrawn = orderedPath.length > 1 && pathNodesRaw.length >= orderedPath.length - 2;
      fpvStateRef.current.isFullyDrawn = isFullyDrawn;

      if (activePathNodes.length > 1) {
        const points = activePathNodes.map(n => new THREE.Vector3(
          startX + n.col * tileSize,
          0,
          startZ + n.row * tileSize
        ));
        const curve = new THREE.CatmullRomCurve3(points);
        curve.curveType = 'centripetal'; 
        curve.tension = 0.5; 
        fpvStateRef.current.pathCurve = curve;
      }

      fpvStateRef.current.targetProgress = pathNodesRaw.length;
      fpvStateRef.current.startX = startX;
      fpvStateRef.current.startZ = startZ;
      fpvStateRef.current.tileSize = tileSize;
      fpvStateRef.current.isPathAnimating = true;

      // Snap camera instantly to avoid glitch at start of path
      if (!wasPathFoundRef.current) {
        fpvStateRef.current.smoothProgress = 0;
        if (cameraRef.current && activePathNodes.length > 0) {
          cameraRef.current.position.set(
            startX + activePathNodes[0].col * tileSize,
            3.5, // Lower street-level height above the path
            startZ + activePathNodes[0].row * tileSize
          );
        }
        wasPathFoundRef.current = true;
      }
    } else {
      // Searching Phase: Track active search frontier node
      fpvStateRef.current.isPathAnimating = false;
      wasPathFoundRef.current = false;

      let head = startNode;
      if (visitedNodes.length > 0 && endNode) {
        let minDist = Infinity;
        for (const vn of visitedNodes) {
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
      fpvStateRef.current.forwardPos.copy(fpvStateRef.current.headPos);
    }
  }, [grid]);

  // ── Scene, Renderer, Camera, Lights & Mesh Pre-allocation
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x000000 : 0xf8fafc);
    if (isDark) scene.fog = new THREE.FogExp2(0x000000, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
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
      m.frustumCulled = false;
      m.count = 0; 
      scene.add(m);
    });

    meshesRef.current = { wall: wallMesh, visited: visitedMesh, path: pathMesh, ground: groundMesh };

    // Animation Loop (FPV Drone Flying Overhead Above Yellow Path)
    let animationFrameId;
    const lookTarget = lookTargetRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!cameraRef.current) return;

      if (isFPV) {
        const fpv = fpvStateRef.current;

        if (fpv.isPathAnimating && fpv.activePathNodes && fpv.activePathNodes.length > 0) {
          const maxIdx = fpv.activePathNodes.length - 1;
          
          // Let the helicopter stay ~1.5 blocks behind the drawn tip so the user can clearly see the path being drawn!
          // But if the path is completely finished, glide all the way to the red finish line!
          let target = Math.max(0, fpv.targetProgress - 1.5);
          if (fpv.isFullyDrawn) {
            target = maxIdx;
          }
          
          // Smoothly glide towards the trailing target
          fpv.smoothProgress = THREE.MathUtils.lerp(fpv.smoothProgress, target, 0.02);

          const isFinished = fpv.isFullyDrawn && fpv.smoothProgress >= maxIdx - 0.5;

          let headX, headZ, forwardX, forwardZ;

          if (fpv.pathCurve) {
            // Spline path: Perfectly smooth curves through corners!
            const curveT = THREE.MathUtils.clamp(fpv.smoothProgress / maxIdx, 0, 1);
            const headPos = fpv.pathCurve.getPoint(curveT);
            headX = headPos.x;
            headZ = headPos.z;

            // Look 3 blocks ahead smoothly
            const lookProgress = Math.min(fpv.smoothProgress + 3.0, maxIdx);
            const lookT = THREE.MathUtils.clamp(lookProgress / maxIdx, 0, 1);
            const forwardPos = fpv.pathCurve.getPoint(lookT);
            forwardX = forwardPos.x;
            forwardZ = forwardPos.z;
          } else {
            // Fallback for very short paths
            headX = fpv.startX + fpv.activePathNodes[0].col * fpv.tileSize;
            headZ = fpv.startZ + fpv.activePathNodes[0].row * fpv.tileSize;
            forwardX = headX;
            forwardZ = headZ;
          }

          if (isFinished) {
            // Auto zoom out to reset view once finished (Seamless cinematic drone liftoff!)
            cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 65, 0.05);
            cameraRef.current.updateProjectionMatrix();

            const time = Date.now() * 0.00003;
            const radius = 46;
            const overviewX = Math.sin(time) * radius;
            const overviewY = 30;
            const overviewZ = Math.cos(time) * radius + 4;

            const zoomOutPos = new THREE.Vector3(overviewX, overviewY, overviewZ);
            cameraRef.current.position.lerp(zoomOutPos, 0.025); // Slow majestic zoom out

            lookTarget.lerp(new THREE.Vector3(0, 0, 0), 0.04);
            cameraRef.current.lookAt(lookTarget);
            cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, 0, 0.05);
          } else {
            // Street-level "New York" perception
            const height = 3.5; 
            const targetCamPos = new THREE.Vector3(headX, height, headZ);
            
            // Motion blur simulation: widen FOV slightly based on movement speed
            const speed = targetCamPos.distanceTo(cameraRef.current.position);
            const targetFov = 65 + (speed * 40.0); // Widen FOV when moving fast
            cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFov, 0.1);
            cameraRef.current.updateProjectionMatrix();
            
            // Tightly bind camera to the heavily smoothed Spline path
            cameraRef.current.position.lerp(targetCamPos, 0.8); 

            // Look straight ahead into the distance (horizon), not at the ground!
            const forwardTarget = new THREE.Vector3(forwardX, height, forwardZ);
            
            if (forwardTarget.distanceToSquared(targetCamPos) > 0.01) {
              lookTarget.lerp(forwardTarget, 0.4);
            }
            cameraRef.current.lookAt(lookTarget);

            // Corner banking tilt (subtle for first-person view, but enhanced for spline curves)
            const headingDiff = forwardX - headX;
            const targetBank = THREE.MathUtils.clamp(-headingDiff * 0.08, -0.15, 0.15);
            cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, targetBank, 0.1);
          }
        } else {
          // Search phase: Hovering overhead
          cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 65, 0.1);
          cameraRef.current.updateProjectionMatrix();

          const targetCamPos = new THREE.Vector3(
            fpv.headPos.x,
            14,
            fpv.headPos.z + 12
          );
          cameraRef.current.position.lerp(targetCamPos, 0.08);
          lookTarget.lerp(fpv.headPos, 0.1);
          cameraRef.current.lookAt(lookTarget);
          cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, 0, 0.1);
        }
      } else {
        // Overview Camera
        if (cameraRef.current.rotation.z !== 0) {
          cameraRef.current.rotation.z *= 0.9;
          if (Math.abs(cameraRef.current.rotation.z) < 0.001) cameraRef.current.rotation.z = 0;
        }
        const time = Date.now() * 0.00003;
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
      disposeScene(scene);
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
  }, [isDark, grid.length]); 

  // Fast Instanced Mesh Updates (Synchronized Yellow Path Reveal with Helicopter Progress)
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
