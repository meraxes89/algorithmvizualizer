import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sorting3DVisualizer = ({ array = [], comparing = [], swapped = [], pivot = null }) => {
  const { isDark } = useTheme();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const gridRef = useRef(null);
  const barsRef = useRef([]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    const bgHex = isDark ? 0x0f172a : 0xf8fafc;
    scene.background = new THREE.Color(bgHex);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 28, 65);
    camera.lookAt(0, 8, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    dirLight.position.set(25, 45, 25);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 1.5, 100);
    pointLight.position.set(-25, 25, -15);
    scene.add(pointLight);

    // 5. Grid Helper matching current theme
    const gridCenterColor = isDark ? 0x334155 : 0xcbd5e1;
    const gridLineColor = isDark ? 0x1e293b : 0xe2e8f0;
    const gridHelper = new THREE.GridHelper(120, 40, gridCenterColor, gridLineColor);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // 6. Camera Orbit Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cameraRef.current) {
        const time = Date.now() * 0.00025;
        const radius = Math.max(55, (array.length || 30) * 1.4);
        cameraRef.current.position.x = Math.sin(time) * radius;
        cameraRef.current.position.z = Math.cos(time) * radius;
        cameraRef.current.lookAt(0, 8, 0);
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

  // Update 3D bars & Dynamic Scaling
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    barsRef.current.forEach(bar => scene.remove(bar));
    barsRef.current = [];

    const numBars = array.length;
    if (numBars === 0) return;

    const maxVal = Math.max(...array, 100);
    const barWidth = Math.max(0.5, Math.min(1.8, 38 / numBars));
    const spacing = 0.25;
    const totalWidth = numBars * (barWidth + spacing);
    const startX = -totalWidth / 2 + barWidth / 2;

    // Dynamic height scaling: Max bar height capped at 18 units to ensure top is visible
    const maxBarHeight = 18;

    array.forEach((val, idx) => {
      const barHeight = (val / maxVal) * maxBarHeight + 0.6;

      let colorHex = isDark ? 0x4f46e5 : 0x6366f1; // Indigo default
      if (swapped.includes(idx)) colorHex = 0xf43f5e; // Rose swap
      else if (comparing.includes(idx)) colorHex = 0xf59e0b; // Amber compare
      else if (pivot === idx) colorHex = 0x10b981; // Emerald pivot

      const geometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);
      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: isDark ? 0.2 : 0.3,
        metalness: isDark ? 0.5 : 0.2,
        emissive: colorHex,
        emissiveIntensity: comparing.includes(idx) || swapped.includes(idx) ? 0.35 : 0.05
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(startX + idx * (barWidth + spacing), barHeight / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      barsRef.current.push(mesh);
    });

    // Dynamic camera adjustment based on dataset width & max height
    if (cameraRef.current) {
      const targetY = maxBarHeight * 0.45;
      const targetDist = Math.max(50, totalWidth * 1.2);
      cameraRef.current.position.set(0, Math.max(24, maxBarHeight * 1.2), targetDist);
      cameraRef.current.lookAt(0, targetY, 0);
    }
  }, [array, comparing, swapped, pivot, isDark]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors duration-200">
      <div className="absolute top-3 left-3 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
        <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
        <span>3D WebGL Render</span>
      </div>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default Sorting3DVisualizer;
