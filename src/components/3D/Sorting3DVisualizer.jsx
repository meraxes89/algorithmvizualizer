import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sorting3DVisualizer = ({ array = [], comparing = [], swapped = [], pivot = null }) => {
  const { isDark } = useTheme();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const barsGroupRef = useRef(null);

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
      const maxVal = Math.max(...array, 1);
      const totalWidth = array.length * 1.5;
      const targetDist = Math.max(50, totalWidth * 1.2);
      cameraRef.current.position.set(0, Math.max(24, maxVal * 1.2), targetDist);
      cameraRef.current.lookAt(0, maxVal * 0.45, 0);
    }
  };

  // Initialize Three.js Scene (Optimized for High FPS)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 28, 65);
    camera.lookAt(0, 8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Multi-angle lighting without shadow map overhead
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    mainLight.position.set(25, 45, 25);
    scene.add(mainLight);

    // Grid Helper
    const gridCenterColor = isDark ? 0x6366f1 : 0xa5b4fc;
    const gridLineColor = isDark ? 0x18181b : 0xe2e8f0;
    const gridHelper = new THREE.GridHelper(120, 40, gridCenterColor, gridLineColor);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Bars Container Group
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);
    barsGroupRef.current = barsGroup;

    // Ultra-Slow Orbit Loop to conserve CPU resources
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (cameraRef.current) {
        const time = Date.now() * 0.00003; // Slow rotation speed saving CPU/battery
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

  // Dynamic Bar Updates
  useEffect(() => {
    const barsGroup = barsGroupRef.current;
    if (!barsGroup) return;

    while (barsGroup.children.length > 0) {
      const child = barsGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      barsGroup.remove(child);
    }

    const numBars = array.length;
    if (numBars === 0) return;

    const maxVal = Math.max(...array, 100);
    const barWidth = Math.max(0.5, Math.min(1.8, 38 / numBars));
    const spacing = 0.25;
    const totalWidth = numBars * (barWidth + spacing);
    const startX = -totalWidth / 2 + barWidth / 2;
    const maxBarHeight = 18;

    array.forEach((val, idx) => {
      const barHeight = (val / maxVal) * maxBarHeight + 0.6;

      // Monochrome Silver & Metallic Glass Palette
      let colorHex = isDark ? 0xcbd5e1 : 0x64748b;
      let emissiveHex = isDark ? 0x475569 : 0x334155;
      let emissiveIntensity = isDark ? 0.15 : 0.05;

      if (swapped.includes(idx)) {
        colorHex = 0xf43f5e; // Laser Crimson Rose
        emissiveHex = 0xf43f5e;
        emissiveIntensity = 0.7;
      } else if (comparing.includes(idx)) {
        colorHex = 0xfbbf24; // Electric Sunburst Gold
        emissiveHex = 0xfbbf24;
        emissiveIntensity = 0.7;
      } else if (pivot === idx) {
        colorHex = 0x34d399; // Mint Emerald Diamond
        emissiveHex = 0x34d399;
        emissiveIntensity = 0.7;
      }

      const geometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);
      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.2,
        metalness: 0.75,
        emissive: emissiveHex,
        emissiveIntensity: emissiveIntensity
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(startX + idx * (barWidth + spacing), barHeight / 2, 0);
      barsGroup.add(mesh);
    });

    if (cameraRef.current) {
      const targetY = maxBarHeight * 0.45;
      const targetDist = Math.max(50, totalWidth * 1.2);
      cameraRef.current.position.set(0, Math.max(24, maxBarHeight * 1.2), targetDist);
      cameraRef.current.lookAt(0, targetY, 0);
    }
  }, [array, comparing, swapped, pivot, isDark]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-black/60 shadow-sm transition-colors duration-200">
      <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-110px)] bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm truncate">
        <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />
        <span className="truncate">3D WebGL Render</span>
      </div>

      {/* Floating 3D Zoom Controls Widget */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 p-1 rounded-xl shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          title="3D Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          title="3D Zoom Out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          title="Reset 3D Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default Sorting3DVisualizer;
