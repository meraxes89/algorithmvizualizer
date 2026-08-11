// Helper utility to recursively dispose Three.js scene graphs, geometries, materials, and textures
export function disposeScene(scene) {
  if (!scene) return;

  scene.traverse((object) => {
    if (!object.isMesh) return;

    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => disposeMaterial(mat));
      } else {
        disposeMaterial(object.material);
      }
    }
  });
}

function disposeMaterial(material) {
  if (!material) return;
  
  // Dispose textures
  Object.keys(material).forEach((prop) => {
    if (material[prop] && typeof material[prop].dispose === 'function') {
      material[prop].dispose();
    }
  });

  material.dispose();
}
