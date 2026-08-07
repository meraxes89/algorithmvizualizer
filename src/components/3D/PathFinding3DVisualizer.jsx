import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PathFinding3DVisualizer = ({ grid = [], startPos, endPos }) => {
  const { isDark } = useTheme();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const objectsRef = useRef([]);

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

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 35, 40);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
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

    // 6. Camera Orbit Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cameraRef.current) {
        const time = Date.now() * 0.0002;
        const radius = 45;
        cameraRef.current.position.x = Math.sin(time) * radius;
        cameraRef.current.position.z = Math.cos(time) * radius + 5;
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
    };
  }, [isDark]);

  // Update 3D Voxel Grid
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || grid.length === 0) return;

    // Clear previous 3D objects
    objectsRef.current.forEach(obj => scene.remove(obj));
    objectsRef.current = [];

    const numRows = grid.length;
    const numCols = grid[0].length;
    const tileSize = 0.9;
    const startX = -((numCols * tileSize) / 2) + tileSize / 2;
    const startZ = -((numRows * tileSize) / 2) + tileSize / 2;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const node = grid[r][c];
        const posX = startX + c * tileSize;
        const posZ = startZ + r * tileSize;

        // Determine node type & voxel dimensions
        let colorHex = isDark ? 0x1e293b : 0xe2e8f0; // Default floor
        let posY = 0.05;
        let heightY = 0.1;

        if (node.isStart) {
          colorHex = 0x10b981; // Emerald Start
          heightY = 2.5;
          posY = heightY / 2;
        } else if (node.isEnd) {
          colorHex = 0xf43f5e; // Rose Target
          heightY = 2.5;
          posY = heightY / 2;
        } else if (node.isWall) {
          colorHex = isDark ? 0x334155 : 0x64748b; // Wall Pillar
          heightY = 1.8;
          posY = heightY / 2;
        } else if (node.isPath) {
          colorHex = 0xf59e0b; // Gold Shortest Path Laser
          heightY = 0.6;
          posY = heightY / 2;
        } else if (node.isVisited) {
          colorHex = isDark ? 0x3b82f6 : 0x60a5fa; // Visited Node Tile
          heightY = 0.25;
          posY = heightY / 2;
        }

        const geometry = new THREE.BoxGeometry(tileSize * 0.88, heightY, tileSize * 0.88);
        const material = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: node.isPath ? 0.1 : 0.4,
          metalness: node.isPath ? 0.8 : 0.2,
          emissive: colorHex,
          emissiveIntensity: node.isPath || node.isStart || node.isEnd ? 0.35 : 0.05
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, posY, posZ);
        mesh.castShadow = node.isWall || node.isStart || node.isEnd;
        mesh.receiveShadow = true;

        scene.add(mesh);
        objectsRef.current.push(mesh);
      }
    }
  }, [grid, isDark]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors duration-200">
      <div className="absolute top-3 left-3 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
        <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
        <span>3D Voxel Pathfinding Render</span>
      </div>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default PathFinding3DVisualizer;
