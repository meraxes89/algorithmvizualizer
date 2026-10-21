import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { disposeScene } from '../../utils/threeDisposal';
import { createVisibilityRenderLoop } from '../../utils/renderLoop';

const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

const Sorting3DVisualizer = React.memo(({ array = [], comparing = [], swapped = [], pivot = null }) => {
  const { isDark } = useTheme();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const instancedMeshRef = useRef(null);

  const comparingSet = useMemo(() => new Set(comparing), [comparing]);
  const swappedSet = useMemo(() => new Set(swapped), [swapped]);

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

  // Initialize Three.js Scene
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

    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    mainLight.position.set(25, 45, 25);
    scene.add(mainLight);

    const gridCenterColor = isDark ? 0x6366f1 : 0xa5b4fc;
    const gridLineColor = isDark ? 0x18181b : 0xe2e8f0;
    const gridHelper = new THREE.GridHelper(120, 40, gridCenterColor, gridLineColor);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // InstancedMesh setup
    const maxCapacity = 250;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, maxCapacity);
    instancedMesh.count = 0;
    scene.add(instancedMesh);
    instancedMeshRef.current = instancedMesh;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disposeLoop = createVisibilityRenderLoop({
      container,
      onFrame: () => {
        if (cameraRef.current && !reduceMotion) {
          const time = Date.now() * 0.00003;
          const barCount = instancedMeshRef.current?.count || 30;
          const radius = Math.max(55, barCount * 1.4);
          cameraRef.current.position.x = Math.sin(time) * radius;
          cameraRef.current.position.z = Math.cos(time) * radius;
          cameraRef.current.lookAt(0, 8, 0);
        }
        renderer.render(scene, camera);
      },
    });

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
      disposeLoop();
      disposeScene(scene);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark]);

  // Update InstancedMesh instances instead of destroying/creating Meshes!
  useEffect(() => {
    const instancedMesh = instancedMeshRef.current;
    if (!instancedMesh) return;

    const numBars = array.length;
    instancedMesh.count = numBars;

    if (numBars === 0) return;

    const maxVal = Math.max(...array, 100);
    const barWidth = Math.max(0.5, Math.min(1.8, 38 / numBars));
    const spacing = 0.25;
    const totalWidth = numBars * (barWidth + spacing);
    const startX = -totalWidth / 2 + barWidth / 2;
    const maxBarHeight = 18;

    array.forEach((val, idx) => {
      const barHeight = (val / maxVal) * maxBarHeight + 0.6;
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
      } else if (idx === pivot) {
        tempColor.set('#a855f7'); // Pivot purple
      } else {
        tempColor.set(isDark ? '#6366f1' : '#3b82f6'); // Default indigo/blue
      }
      instancedMesh.setColorAt(idx, tempColor);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
  }, [array, comparingSet, swappedSet, pivot, isDark]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mountRef} className="w-full h-full rounded-2xl overflow-hidden" />
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default Sorting3DVisualizer;
