---
name: threejs-patterns
description: >
  Vanilla Three.js patterns for Next.js App Router. Scene setup, GLTF loading,
  camera scroll animation, particle systems, environment lighting, post-processing,
  OrbitControls. Pin three@0.169.0. Import from 'three/addons/'.
trigger_terms: three.js, 3d, webgl, scene, model, particles, 3d background
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

Base pattern for all Three.js work in Next.js.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
```

## Pattern 2: GLTF Model Loading

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export function ModelViewer({ modelPath, className }: {
  modelPath: string;
  className?: string;
}) {
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

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // DRACO decoder for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    // GLTF loader
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    let model: THREE.Group | null = null;

    gltfLoader.load(
      modelPath,
      (gltf) => {
        model = gltf.scene;
        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.multiplyScalar(3 / maxDim);
        model.position.sub(center.multiplyScalar(3 / maxDim));
        scene.add(model);
      },
      undefined,
      (error) => console.error('GLTF load error:', error)
    );

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      dracoLoader.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [modelPath]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
```

## Pattern 3: Camera Scroll Animation

Link camera position/rotation to scroll progress.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollCamera({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Add scene content (meshes, lights, etc.)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Scroll-driven camera animation via GSAP
    const ctx = gsap.context(() => {
      gsap.to(camera.position, {
        z: 2,
        y: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
      gsap.to(camera.rotation, {
        x: -0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    }, container);

    // Render loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', display: 'block' }}
      />
    </div>
  );
}
```

## Pattern 4: Particle System

```tsx
useEffect(() => {
  // ... renderer, scene, camera setup (see Pattern 1) ...

  // Particle system
  const particleCount = 5000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
    renderer.render(scene, camera);
  };
  animate();

  return () => {
    // ... cleanup ...
    geometry.dispose();
    material.dispose();
  };
}, []);
```

## Pattern 5: Environment Lighting (HDR)

```tsx
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

useEffect(() => {
  // ... renderer, scene, camera setup ...

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/environment.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture; // Optional: use as background
  });

  return () => {
    // ... cleanup ...
  };
}, []);
```

## Pattern 6: Post-Processing

```tsx
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

useEffect(() => {
  // ... renderer, scene, camera setup ...

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,  // strength
    0.4,  // radius
    0.85  // threshold
  ));

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    composer.render(); // Use composer.render() instead of renderer.render()
  };
  animate();

  return () => {
    composer.dispose();
    // ... cleanup ...
  };
}, []);
```

## Pattern 7: OrbitControls

```tsx
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

useEffect(() => {
  // ... renderer, scene, camera setup ...

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2;

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);
  };
  animate();

  return () => {
    controls.dispose();
    // ... cleanup ...
  };
}, []);
```

## Cleanup Checklist (ALL Patterns)

Every Three.js component MUST clean up on unmount:

1. `cancelAnimationFrame(animationId)` -- stop render loop
2. `window.removeEventListener('resize', handleResize)` -- remove listeners
3. `renderer.dispose()` -- release WebGL context
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
