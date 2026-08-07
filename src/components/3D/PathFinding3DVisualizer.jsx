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
  const instancedMeshesRef = useRef([]);
  const pathCoordsRef = useRef([]);
  const fpvIndexRef = useRef(0);

  // Collect path coordinates for FPV camera navigation
  useEffect(() => {
    if (!grid || grid.length === 0) return;
    const numRows = grid.length;
    const numCols = grid[0].length;
    const tileSize = 0.9;
    const startX = -((numCols * tileSize) / 2) + tileSize / 2;
    const startZ = -((numRows * tileSize) / 2) + tileSize / 2;

    const pathNodes = [];
    const visitedNodes = [];

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const node = grid[r][c];
        const posX = startX + c * tileSize;
        const posZ = startZ + r * tileSize;
        if (node.isPath) pathNodes.push({ posX, posZ });
        else if (node.isVisited) visitedNodes.push({ posX, posZ });
      }
    }

    pathCoordsRef.current = pathNodes.length > 0 ? pathNodes : visitedNodes;
    fpvIndexRef.current = 0;
  }, [grid]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    const bgHex = isDark ? 0x0f172a : 0xf8fafc;
    scene.background = new THREE.Color(bgHex);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 32, 44);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.75 : 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, isDark ? 1.4 : 1.1);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 1.5, 100);
    pointLight.position.set(-20, 25, -20);
    scene.add(pointLight);

    // 5. Grid Helper
    const gridCenterColor = isDark ? 0x334155 : 0xcbd5e1;
    const gridLineColor = isDark ? 0x1e293b : 0xe2e8f0;
    const gridHelper = new THREE.GridHelper(60, 30, gridCenterColor, gridLineColor);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 6. Camera Animation Loop (Orbit vs FPV Drone Fly-Through)
    let animationFrameId;
    let fpvProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cameraRef.current) {
        if (isFPV && pathCoordsRef.current.length > 1) {
          // FPV Drone Camera Fly-Through Mode along building corridors
          fpvProgress += 0.015;
          if (fpvProgress >= 1) {
            fpvProgress = 0;
            fpvIndexRef.current = (fpvIndexRef.current + 1) % (pathCoordsRef.current.length - 1);
          }

          const idx = fpvIndexRef.current;
          const curr = pathCoordsRef.current[idx];
          const next = pathCoordsRef.current[idx + 1] || curr;

          const camX = THREE.MathUtils.lerp(curr.posX, next.posX, fpvProgress);
          const camZ = THREE.MathUtils.lerp(curr.posZ, next.posZ, fpvProgress);

          // Fly low through skyscraper corridors (y = 1.3)
          cameraRef.current.position.set(camX, 1.3, camZ);
          cameraRef.current.lookAt(next.posX, 1.1, next.posZ);
        } else {
          // Orbit Overview Camera Mode
          const time = Date.now() * 0.00007;
          const radius = 46;
          cameraRef.current.position.x = Math.sin(time) * radius;
          cameraRef.current.position.y = 32;
          cameraRef.current.position.z = Math.cos(time) * radius + 4;
          cameraRef.current.lookAt(0, 0, 0);
        }
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
    };
  }, [isDark, isFPV]);

  // High-performance InstancedMesh Skyscraper & Voxel Update
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || grid.length === 0) return;

    instancedMeshesRef.current.forEach(mesh => scene.remove(mesh));
    instancedMeshesRef.current = [];

    const numRows = grid.length;
    const numCols = grid[0].length;
    const totalTiles = numRows * numCols;
    const tileSize = 0.9;
    const startX = -((numCols * tileSize) / 2) + tileSize / 2;
    const startZ = -((numRows * tileSize) / 2) + tileSize / 2;

    const boxGeometry = new THREE.BoxGeometry(tileSize * 0.88, 1, tileSize * 0.88);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.35
    });

    const instancedMesh = new THREE.InstancedMesh(boxGeometry, material, totalTiles);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let idx = 0;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const node = grid[r][c];
        const posX = startX + c * tileSize;
        const posZ = startZ + r * tileSize;

        let heightY = 0.1;
        let posY = 0.05;
        let hexColor = isDark ? 0x1e293b : 0xf1f5f9;

        if (node.isStart) {
          hexColor = 0x10b981; // Emerald Start Beacon
          heightY = 3.2;
          posY = heightY / 2;
        } else if (node.isEnd) {
          hexColor = 0xf43f5e; // Rose Target Beacon
          heightY = 3.2;
          posY = heightY / 2;
        } else if (node.isWall) {
          // Varying skyscraper building heights for NYC aesthetic
          const pseudoHash = ((r * 13 + c * 37) % 5) * 0.7;
          hexColor = isDark ? 0x334155 : 0x475569; // Skyscraper wall
          heightY = 2.4 + pseudoHash;
          posY = heightY / 2;
        } else if (node.isPath) {
          hexColor = 0xf59e0b; // Gold Shortest Path Street Light
          heightY = 0.55;
          posY = heightY / 2;
        } else if (node.isVisited) {
          hexColor = isDark ? 0x3b82f6 : 0x60a5fa; // Visited Tile
          heightY = 0.25;
          posY = heightY / 2;
        }

        dummy.position.set(posX, posY, posZ);
        dummy.scale.set(1, heightY, 1);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(idx, dummy.matrix);
        color.setHex(hexColor);
        instancedMesh.setColorAt(idx, color);
        idx++;
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);
    instancedMeshesRef.current.push(instancedMesh);
  }, [grid, isDark]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors duration-200">
      {/* Overlay Badge & FPV Drone Switch */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
          <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
          <span>3D NYC Skyscraper Voxel Render</span>
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
