import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Sorting3DVisualizer = ({ array = [], comparing = [], swapped = [], pivot = null }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900 background
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 30, 70);
    camera.lookAt(0, 10, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 100);
    pointLight.position.set(-20, 20, -10);
    scene.add(pointLight);

    // 5. Reflective Ground Floor Grid
    const gridHelper = new THREE.GridHelper(100, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 6. Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle ambient camera float rotation
      const time = Date.now() * 0.0003;
      camera.position.x = Math.sin(time) * 65;
      camera.position.z = Math.cos(time) * 65;
      camera.lookAt(0, 12, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
  }, []);

  // Update 3D bars when array or highlight states change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous bars
    barsRef.current.forEach(bar => scene.remove(bar));
    barsRef.current = [];

    const numBars = array.length;
    if (numBars === 0) return;

    const barWidth = Math.max(0.6, 40 / numBars);
    const spacing = 0.3;
    const totalWidth = numBars * (barWidth + spacing);
    const startX = -totalWidth / 2 + barWidth / 2;

    array.forEach((val, idx) => {
      const barHeight = (val / 100) * 28 + 1;

      // Color selection
      let colorHex = 0x3b82f6; // Blue default
      if (swapped.includes(idx)) colorHex = 0xf43f5e; // Rose/Red swap
      else if (comparing.includes(idx)) colorHex = 0xf59e0b; // Amber compare
      else if (pivot === idx) colorHex = 0x10b981; // Emerald pivot

      const geometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);
      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.2,
        metalness: 0.6,
        emissive: colorHex,
        emissiveIntensity: comparing.includes(idx) || swapped.includes(idx) ? 0.4 : 0.05
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(startX + idx * (barWidth + spacing), barHeight / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      barsRef.current.push(mesh);
    });
  }, [array, comparing, swapped, pivot]);

  return (
    <div className="relative w-full h-[450px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        3D Spatial WebGL Render
      </div>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default Sorting3DVisualizer;
