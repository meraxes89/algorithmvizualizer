import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Box, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const INITIAL_ARRAY = [45, 12, 85, 32, 98, 23, 67, 14, 56, 89, 29, 74, 38, 91, 18, 62];

const Hero3DVisualizer = () => {
  const { isDark } = useTheme();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const barsGroupRef = useRef(null);

  const [array, setArray] = useState(INITIAL_ARRAY);
  const [comparing, setComparing] = useState([]);
  const [swapped, setSwapped] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // Sorting step generator for hero demo
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setArray(prev => {
          const next = [...prev];
          const i = Math.floor(Math.random() * (next.length - 1));
          if (next[i] > next[i + 1]) {
            const temp = next[i];
            next[i] = next[i + 1];
            next[i + 1] = temp;
            setSwapped([i, i + 1]);
            setComparing([]);
          } else {
            setComparing([i, i + 1]);
            setSwapped([]);
          }
          return next;
        });
        setActiveStep(s => s + 1);
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleReset = () => {
    setArray([45, 12, 85, 32, 98, 23, 67, 14, 56, 89, 29, 74, 38, 91, 18, 62]);
    setComparing([]);
    setSwapped([]);
    setActiveStep(0);
  };

  // Three.js Scene Setup (High FPS, Zero Shadow Map Overhead)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 24, 48);
    camera.lookAt(0, 6, 0);
    cameraRef.current = camera;

    // High speed WebGL Renderer without shadow map overhead
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Optimized Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Grid Helper
    const gridCenterColor = isDark ? 0x6366f1 : 0xa5b4fc;
    const gridLineColor = isDark ? 0x1e1b4b : 0xe2e8f0;
    const gridHelper = new THREE.GridHelper(80, 24, gridCenterColor, gridLineColor);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Bars Container Group
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);
    barsGroupRef.current = barsGroup;

    // Fast & CPU-Efficient Ultra-Slow Orbit Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (cameraRef.current) {
        const time = Date.now() * 0.00005; // Ultra-slow rotation to save CPU & battery
        cameraRef.current.position.x = Math.sin(time) * 44;
        cameraRef.current.position.z = Math.cos(time) * 44;
        cameraRef.current.lookAt(0, 6, 0);
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
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark]);

  // Fast Bar Position & Color Updates (Reusing Meshes where possible)
  useEffect(() => {
    const barsGroup = barsGroupRef.current;
    if (!barsGroup) return;

    // Clear previous mesh group
    while (barsGroup.children.length > 0) {
      const child = barsGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      barsGroup.remove(child);
    }

    const numBars = array.length;
    const maxVal = 100;
    const barWidth = 1.6;
    const spacing = 0.4;
    const totalWidth = numBars * (barWidth + spacing);
    const startX = -totalWidth / 2 + barWidth / 2;

    array.forEach((val, idx) => {
      const barHeight = (val / maxVal) * 14 + 0.5;

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
  }, [array, comparing, swapped, isDark]);

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden glass-card border border-slate-200/80 dark:border-indigo-500/20 shadow-xl transition-all group">
      {/* Header Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-black/85 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-800 dark:text-white shadow-md">
        <Box className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
        <span>3D WebGL Visualization</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping ml-1" />
      </div>

      {/* Control Widgets */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          title={isPlaying ? 'Pause Demo' : 'Play Demo'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white/90 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl shadow-md transition-all active:scale-95"
          title="Reset Dataset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom HUD Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between bg-white/90 dark:bg-zinc-950/85 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-300 shadow-md">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Steps: <strong className="text-indigo-600 dark:text-white font-mono">{activeStep}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-amber-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Comparing
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-rose-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Swapping
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero3DVisualizer;
