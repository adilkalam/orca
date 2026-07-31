---
name: three-js-animation
description: Three.js animation - keyframe animation, skeletal animation, morph targets, animation mixing. Use when animating objects, playing GLTF animations, creating procedural motion, or blending animations.
---

# Three.js Animation

## Quick Start

```javascript
import * as THREE from "three";

const timer = new THREE.Timer(); // recommended over THREE.Clock as of r183

renderer.setAnimationLoop(() => {
  timer.update();
  const delta = timer.getDelta();
  const elapsed = timer.getElapsed();
  mesh.rotation.y += delta;
  mesh.position.y = Math.sin(elapsed) * 0.5;
  renderer.render(scene, camera);
});
```

`THREE.Timer` pauses when the page is hidden and has a cleaner API than the legacy `THREE.Clock`.

## Animation System Overview

1. **AnimationClip** — container for keyframe data
2. **AnimationMixer** — plays animations on a root object
3. **AnimationAction** — controls playback of a clip

## AnimationClip

```javascript
const times = [0, 1, 2];
const values = [0, 1, 0];
const track = new THREE.NumberKeyframeTrack(".position[y]", times, values);
const clip = new THREE.AnimationClip("bounce", 2, [track]);
```

### KeyframeTrack Types

```javascript
new THREE.NumberKeyframeTrack(".material.opacity", times, [1, 0]);
new THREE.VectorKeyframeTrack(".position", times, [0,0,0, 1,2,0, 0,0,0]);
const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
new THREE.QuaternionKeyframeTrack(".quaternion", [0, 1], [q1.x,q1.y,q1.z,q1.w, q2.x,q2.y,q2.z,q2.w]);
new THREE.ColorKeyframeTrack(".material.color", times, [1,0,0, 0,1,0, 0,0,1]);
new THREE.BooleanKeyframeTrack(".visible", [0, 0.5, 1], [true, false, true]);
new THREE.StringKeyframeTrack(".morphTargetInfluences[smile]", [0, 1], ["0", "1"]);
```

### Interpolation Modes

```javascript
track.setInterpolation(THREE.InterpolateLinear);   // default
track.setInterpolation(THREE.InterpolateSmooth);    // cubic spline
track.setInterpolation(THREE.InterpolateDiscrete);  // step function
```

`THREE.BezierInterpolant` (r183+) adds bezier curve interpolation for keyframe tracks.

## AnimationMixer

```javascript
const mixer = new THREE.AnimationMixer(model);
const action = mixer.clipAction(clip);
action.play();

function animate() {
  const delta = clock.getDelta();
  mixer.update(delta); // Required!
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
```

```javascript
mixer.addEventListener("finished", (e) => console.log("Animation finished:", e.action.getClip().name));
mixer.addEventListener("loop", (e) => console.log("Animation looped:", e.action.getClip().name));
```

## AnimationAction

```javascript
const action = mixer.clipAction(clip);
action.play(); action.stop(); action.reset(); action.halt(fadeOutDuration);
action.isRunning(); action.isScheduled();
action.time = 0.5;
action.timeScale = 1; // negative = reverse
action.paused = false;
action.weight = 1; // 0-1, contribution to final pose
action.loop = THREE.LoopRepeat; // or LoopOnce, LoopPingPong
action.repetitions = 3;
action.clampWhenFinished = true;
action.blendMode = THREE.NormalAnimationBlendMode; // or AdditiveAnimationBlendMode
```

### Fade In/Out

```javascript
action.reset().fadeIn(0.5).play();
action.fadeOut(0.5);

const action1 = mixer.clipAction(clip1);
const action2 = mixer.clipAction(clip2);
action1.play();
action1.crossFadeTo(action2, 0.5, true);
action2.play();
```

## Loading GLTF Animations

```javascript
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load("model.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  const mixer = new THREE.AnimationMixer(model);
  const clips = gltf.animations;
  if (clips.length > 0) mixer.clipAction(clips[0]).play();
  const walkClip = THREE.AnimationClip.findByName(clips, "Walk");
  if (walkClip) mixer.clipAction(walkClip).play();
  window.mixer = mixer;
});

function animate() {
  const delta = clock.getDelta();
  if (window.mixer) window.mixer.update(delta);
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
```

## Skeletal Animation

```javascript
const skinnedMesh = model.getObjectByProperty("type", "SkinnedMesh");
const skeleton = skinnedMesh.skeleton;
skeleton.bones.forEach((bone) => console.log(bone.name, bone.position, bone.rotation));
const headBone = skeleton.bones.find((b) => b.name === "Head");
if (headBone) headBone.rotation.y = Math.PI / 4;

const helper = new THREE.SkeletonHelper(model);
scene.add(helper);
```

### Programmatic Bone Animation

```javascript
function animate() {
  const time = clock.getElapsedTime();
  const headBone = skeleton.bones.find((b) => b.name === "Head");
  if (headBone) headBone.rotation.y = Math.sin(time) * 0.3;
  mixer.update(clock.getDelta());
}
```

### Bone Attachments

```javascript
const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
const handBone = skeleton.bones.find((b) => b.name === "RightHand");
if (handBone) handBone.add(weapon);
weapon.position.set(0, 0, 0.5);
weapon.rotation.set(0, Math.PI / 2, 0);
```

## Morph Targets

```javascript
const geometry = mesh.geometry;
mesh.morphTargetInfluences[0] = 0.5;
const smileIndex = mesh.morphTargetDictionary["smile"];
mesh.morphTargetInfluences[smileIndex] = 1;
```

```javascript
// Procedural
function animate() {
  const t = clock.getElapsedTime();
  mesh.morphTargetInfluences[0] = (Math.sin(t) + 1) / 2;
}

// Keyframed
const track = new THREE.NumberKeyframeTrack(".morphTargetInfluences[smile]", [0, 0.5, 1], [0, 1, 0]);
const clip = new THREE.AnimationClip("smile", 1, [track]);
mixer.clipAction(clip).play();
```

## Animation Blending

```javascript
const idleAction = mixer.clipAction(idleClip);
const walkAction = mixer.clipAction(walkClip);
const runAction = mixer.clipAction(runClip);
idleAction.play(); walkAction.play(); runAction.play();
idleAction.setEffectiveWeight(1);
walkAction.setEffectiveWeight(0);
runAction.setEffectiveWeight(0);

function updateAnimations(speed) {
  if (speed < 0.1) { idleAction.setEffectiveWeight(1); walkAction.setEffectiveWeight(0); runAction.setEffectiveWeight(0); }
  else if (speed < 5) { const t = speed / 5; idleAction.setEffectiveWeight(1 - t); walkAction.setEffectiveWeight(t); runAction.setEffectiveWeight(0); }
  else { const t = Math.min((speed - 5) / 5, 1); idleAction.setEffectiveWeight(0); walkAction.setEffectiveWeight(1 - t); runAction.setEffectiveWeight(t); }
}
```

### Additive Blending

```javascript
const baseAction = mixer.clipAction(baseClip);
baseAction.play();
const additiveAction = mixer.clipAction(additiveClip);
additiveAction.blendMode = THREE.AdditiveAnimationBlendMode;
additiveAction.play();
THREE.AnimationUtils.makeClipAdditive(additiveClip);
```

## Animation Utilities

```javascript
const clip = THREE.AnimationClip.findByName(clips, "Walk");
const subclip = THREE.AnimationUtils.subclip(clip, "subclip", 0, 30, 30);
THREE.AnimationUtils.makeClipAdditive(clip);
const clone = clip.clone();
clip.duration; clip.optimize(); clip.resetDuration();
```

## Procedural Animation Patterns

### Smooth Damping

```javascript
function smoothDamp(current, target, velocity, smoothTime, deltaTime) {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current.clone().sub(target);
  const temp = velocity.clone().add(change.clone().multiplyScalar(omega)).multiplyScalar(deltaTime);
  velocity.sub(temp.clone().multiplyScalar(omega)).multiplyScalar(exp);
  return target.clone().add(change.add(temp).multiplyScalar(exp));
}
```

### Spring Physics

```javascript
class Spring {
  constructor(stiffness = 100, damping = 10) {
    this.stiffness = stiffness; this.damping = damping;
    this.position = 0; this.velocity = 0; this.target = 0;
  }
  update(dt) {
    const force = -this.stiffness * (this.position - this.target);
    const dampingForce = -this.damping * this.velocity;
    this.velocity += (force + dampingForce) * dt;
    this.position += this.velocity * dt;
    return this.position;
  }
}
```

### Oscillation

```javascript
function animate() {
  const t = clock.getElapsedTime();
  mesh.position.y = Math.sin(t * 2) * 0.5;           // sine wave
  mesh.position.y = Math.abs(Math.sin(t * 3)) * 2;   // bouncing
  mesh.position.x = Math.cos(t) * 2; mesh.position.z = Math.sin(t) * 2; // circular
  mesh.position.x = Math.sin(t) * 2; mesh.position.z = Math.sin(t * 2) * 1; // figure 8
}
```

## Performance Tips

1. Share clips: same AnimationClip can be used on multiple mixers.
2. `clip.optimize()` to remove redundant keyframes.
3. Disable/pause mixer updates for off-screen or invisible objects.
4. Use LOD for animations (simpler rigs for distant characters).
5. Limit active mixers — each `mixer.update()` has a cost.

```javascript
const clipCache = new Map();
function getClip(name) {
  if (!clipCache.has(name)) clipCache.set(name, loadClip(name));
  return clipCache.get(name);
}
```

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
