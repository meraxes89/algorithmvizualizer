import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { disposeScene } from '../../utils/threeDisposal';

const INITIAL_ARRAY = [45, 12, 85, 32, 98, 23, 67, 14, 56, 89, 29, 74, 38, 91, 18, 62];

const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

const Hero3DVisualizer = React.memo(() => {
  const { isDark } = useTheme();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const instancedMeshRef = useRef(null);

  const [array, setArray] = useState(INITIAL_ARRAY);
  const [comparing, setComparing] = useState([]);
  const [swapped, setSwapped] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);

  const comparingSet = useMemo(() => new Set(comparing), [comparing]);
  const swappedSet = useMemo(() => new Set(swapped), [swapped]);

  // Demo step generator
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
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleReset = () => {
    setArray(INITIAL_ARRAY);
    setComparing([]);
    setSwapped([]);
  };

  // Three.js Scene Setup with InstancedMesh
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const gridCenterColor = isDark ? 0x6366f1 : 0xa5b4fc;
    const gridLineColor = isDark ? 0x1e1b4b : 0xe2e8f0;
    const gridHelper = new THREE.GridHelper(80, 24, gridCenterColor, gridLineColor);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Single InstancedMesh for all bars
    const maxCapacity = 50;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, maxCapacity);
    instancedMesh.count = INITIAL_ARRAY.length;
    scene.add(instancedMesh);
    instancedMeshRef.current = instancedMesh;

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (cameraRef.current) {
        const time = Date.now() * 0.00005;
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
      disposeScene(scene);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark]);

  // Update InstancedMesh instances on array change
  useEffect(() => {
    const instancedMesh = instancedMeshRef.current;
    if (!instancedMesh) return;

    const numBars = array.length;
    instancedMesh.count = numBars;
    if (numBars === 0) return;

    const maxVal = 100;
    const barWidth = 1.6;
    const spacing = 0.4;
    const totalWidth = numBars * (barWidth + spacing);
    const startX = -totalWidth / 2 + barWidth / 2;
    const maxBarHeight = 15;

    array.forEach((val, idx) => {
      const barHeight = (val / maxVal) * maxBarHeight + 0.5;
      const posX = startX + idx * (barWidth + spacing);
      const posY = barHeight / 2;

      dummy.position.set(posX, posY, 0);
      dummy.scale.set(barWidth, barHeight, barWidth);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(idx, dummy.matrix);

      if (swappedSet.has(idx)) {
        tempColor.set('#f43f5e'); // Swapping rose
      } else if (comparingSet.has(idx)) {
        tempColor.set('#f59e0b'); // Comparing amber
      } else {
        tempColor.set(isDark ? '#6366f1' : '#3b82f6'); // Default indigo/blue
      }
      instancedMesh.setColorAt(idx, tempColor);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
  }, [array, comparingSet, swappedSet, isDark]);

  return (
    <div className="relative w-full h-[380px] rounded-3xl overflow-hidden glass-card bg-slate-900/60 dark:bg-black/80 border border-slate-200/20 dark:border-zinc-800/80 shadow-2xl">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all shadow-md"
          title={isPlaying ? 'Pause Demo' : 'Play Demo'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all shadow-md"
          title="Reset Data"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
});

export default Hero3DVisualizer;
