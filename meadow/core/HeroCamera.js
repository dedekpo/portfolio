// Camera rig. By default it sits exactly on the reference shot and only breathes / follows the
// pointer by a degree or two (a locked-off cinematic with parallax). Press F for a free orbit.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HERO, PORTRAIT } from '../config.js';

export class HeroCamera {
  constructor(dom, { still = false } = {}) {
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.12, 9000);
    this.camera.rotation.order = 'YXZ';
    this.still = still;
    this.free = false;
    this.tall = 0; // 0 = the hero shot, 1 = the portrait shot (see setAspect)
    this.moving = false;
    this.pointer = new THREE.Vector2();
    this.smooth = new THREE.Vector2();

    this.controls = new OrbitControls(this.camera, dom);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(-2.5, 1.6, -14);
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 90;

    window.addEventListener('pointermove', (e) => {
      // a finger only steers the view when it is dragging on the picture itself, not on a link
      if (e.pointerType !== 'mouse' && e.target !== dom) return;
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    });
    // a finger has no resting position: when it lifts, the view eases back to the shot
    const release = (e) => {
      if (e.pointerType !== 'mouse') this.pointer.set(0, 0);
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    this.applyHero(0);
  }

  setAspect(aspect) {
    // Keep the reference framing fully visible on any window shape: lock the horizontal FOV when
    // the window is narrower than the reference, the vertical FOV when it is wider.
    const refH = THREE.MathUtils.degToRad(HERO.hFov);
    const refV = 2 * Math.atan(Math.tan(refH / 2) / HERO.aspect);
    let v = aspect >= HERO.aspect ? refV : 2 * Math.atan(Math.tan(refH / 2) / aspect);
    // ...until the window is tall: from there the lens stays put and the frame is cropped at the
    // sides instead, while the camera turns to the portrait shot (see PORTRAIT in config.js).
    const vMax = THREE.MathUtils.degToRad(PORTRAIT.vFov);
    const aspectWide = Math.tan(refH / 2) / Math.tan(vMax / 2); // where the cap starts to bite
    this.tall = 1 - THREE.MathUtils.smoothstep(aspect, PORTRAIT.aspectTall, aspectWide);
    v = Math.min(v, vMax);
    this.camera.fov = THREE.MathUtils.radToDeg(v);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  toggleFree() {
    this.free = !this.free;
    this.controls.enabled = this.free;
    if (this.free) {
      this.controls.target.set(-2.5, 1.6, -14);
      this.controls.update();
    }
    return this.free;
  }

  applyHero(time) {
    const cam = this.camera;
    const k = this.still ? 0 : 1;
    const mx = this.smooth.x * k, my = this.smooth.y * k;
    const breatheX = Math.sin(time * 0.31) * 0.012 * k;
    const breatheY = Math.sin(time * 0.47 + 1.3) * 0.008 * k;
    const yaw = HERO.yaw + PORTRAIT.yaw * this.tall;
    const pitch = HERO.pitch + (PORTRAIT.pitch - HERO.pitch) * this.tall;
    cam.position.set(HERO.position.x + mx * 0.22 + breatheX, HERO.position.y - my * 0.07 + breatheY, HERO.position.z);
    cam.rotation.set(pitch - my * 0.022, yaw - mx * 0.04, Math.sin(time * 0.23) * 0.0015 * k);
  }

  update(dt, time) {
    if (this.free) {
      this.controls.update();
    } else {
      const a = 1 - Math.exp(-dt * 2.2);
      this.moving = this.smooth.distanceToSquared(this.pointer) > 4e-6; // still easing towards the pointer
      this.smooth.lerp(this.pointer, a);
      this.applyHero(time);
    }
    this.camera.updateMatrixWorld();
  }
}
