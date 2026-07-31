---
name: threejs-patterns
description: Vanilla Three.js patterns for Next.js App Router. Scene setup, GLTF loading, camera scroll animation, particle systems, environment lighting, post-processing, OrbitControls. Pin three@0.169.0. Import from 'three/addons/'. Use when the user wants 3D scenes, WebGL backgrounds, or model viewers.
---

# Three.js Patterns for Next.js

**Version:** three@0.169.0 + @types/three@0.169.0
**Framework:** Vanilla Three.js ONLY -- NOT React Three Fiber.
**Import path for addons:** `import { X } from 'three/addons/...'`

## Installation

```bash
npm install three@0.169.0 @types/three@0.169.0
```

## Pattern 1: Scene Setup

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
          else object.material.dispose();
        }
      });
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
```

## Pattern 2: GLTF Model Loading

```tsx
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(modelPath, (gltf) => {
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  model.scale.multiplyScalar(3 / maxDim);
  model.position.sub(center.multiplyScalar(3 / maxDim));
  scene.add(model);
}, undefined, (error) => console.error('GLTF load error:', error));
```

## Pattern 3: Camera Scroll Animation

Link camera position/rotation to scroll progress via GSAP ScrollTrigger:

```tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const ctx = gsap.context(() => {
  gsap.to(camera.position, {
    z: 2, y: 3, ease: 'none',
    scrollTrigger: { trigger: container, start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
}, container);
// cleanup: ctx.revert()
```

## Pattern 4: Particle System

```tsx
const particleCount = 5000;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 20;

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.8, sizeAttenuation: true });
const particles = new THREE.Points(geometry, material);
scene.add(particles);
```

## Pattern 5: Environment Lighting (HDR)

```tsx
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

new RGBELoader().load('/environment.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});
```

## Pattern 6: Post-Processing

```tsx
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85));
// render loop uses composer.render() instead of renderer.render()
```

## Pattern 7: OrbitControls

```tsx
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;
// call controls.update() each frame, controls.dispose() on cleanup
```

## Cleanup Checklist (ALL Patterns)

Every Three.js component MUST clean up on unmount:
1. `cancelAnimationFrame(animationId)`
2. `window.removeEventListener('resize', handleResize)`
3. `renderer.dispose()`
4. Traverse scene and dispose all geometries and materials
5. Dispose loaders (`dracoLoader.dispose()`)
6. Dispose post-processing (`composer.dispose()`)
7. Dispose controls (`controls.dispose()`)

Failure to clean up causes WebGL context leaks and memory issues.

## Constraints

- **NO React Three Fiber** -- vanilla Three.js only
- **NO custom GLSL shaders** in v1 -- use built-in materials and post-processing
- **Pin version:** three@0.169.0
- **Import addons from:** `'three/addons/...'` (NOT `'three/examples/jsm/...'`)
- **Canvas sizing:** Use `canvas.clientWidth/clientHeight`, not `window.innerWidth/innerHeight`
- **Pixel ratio:** Cap at 2 with `Math.min(window.devicePixelRatio, 2)`

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
