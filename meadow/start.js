// Start-up of the meadow scene inside the page.
//
// This is the scene's entry point (src/main.js in the stylized-meadow project) reshaped as a
// function: the page hands over a canvas and is told when the first picture is on screen.
// config.js and everything under core/ and world/ are copied from that project unchanged, so the
// scene is updated by copying them again. Only this file knows about the page around it.
//
// It may only run in a browser (the modules read `location` and `window` as they load), so the
// page imports it from an effect, never during server rendering.

import * as THREE from 'three';
import { LAYERS, pickQuality, SUN } from './config.js';
import { HeroCamera } from './core/HeroCamera.js';
import { createPipeline } from './core/pipeline.js';
import { G } from './core/shaderlib.js';
import { makeCloudNoise3D, makeNoiseTexture } from './core/textures.js';
import { createGroundCover } from './world/Grass.js';
import { bakeTerrainMaps, REGION } from './world/heightfield.js';
import { buildLayout } from './world/layout.js';
import { createMountains } from './world/Mountains.js';
import { createRocks } from './world/Rocks.js';
import { Sky } from './world/Sky.js';
import { createTerrain } from './world/Terrain.js';
import { createBushes, createTrees, culler } from './world/Trees.js';
import { createWater } from './world/Water.js';
import { createWindFX } from './world/WindFX.js';

/**
 * Building the world takes a good half second of solid work on a desktop and a few seconds on a
 * phone. Stopping between the steps lets the browser paint and answer taps in the meantime: the
 * name, the links and their entrance are already on screen while this runs.
 */
const breathe = () => new Promise((resolve) => setTimeout(resolve, 0));

let running = null;

/**
 * Builds the scene on `canvas` and starts drawing it. Safe to call more than once: later calls
 * get the same run.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {object} [hooks]
 * @param {() => void} [hooks.onFirstFrame] the first picture is on screen (also after the GPU context was lost and came back)
 * @param {(free: boolean) => void} [hooks.onFreeCamera] F switched the free camera on or off
 * @param {() => void} [hooks.onContextLost] the browser took the GPU context away
 * @returns {Promise<object>} rejects when WebGL is not available
 */
export function startMeadow(canvas, hooks = {}) {
  running ??= build(canvas, hooks);
  return running;
}

async function build(canvas, hooks) {
  const params = new URLSearchParams(location.search);
  const quality = pickQuality();
  const still = params.has('still'); // locked-off camera, fixed resolution (used for A/B captures)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  renderer.toneMapping = THREE.NoToneMapping; // tone mapping + sRGB encode happen in the grade pass
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // refreshed every other frame, see the loop
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const rig = new HeroCamera(canvas, { still });
  const camera = rig.camera;

  // ---- shared procedural textures -----------------------------------------------------------
  G.uNoiseTex.value = makeNoiseTexture(256);
  await breathe();

  // ---- sun (only used for its shadow map; shading is done by our own stylized shaders) -------
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  const shadowCenter = new THREE.Vector3(-2, 0, -26);
  sun.position.copy(shadowCenter).addScaledVector(SUN.dir, 170);
  sun.target.position.copy(shadowCenter);
  sun.castShadow = true;
  sun.shadow.mapSize.set(quality.shadow, quality.shadow);
  Object.assign(sun.shadow.camera, { left: -62, right: 62, top: 62, bottom: -62, near: 20, far: 340 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.05;
  sun.shadow.camera.layers.set(LAYERS.shadowCasters); // the shadow map sees shadow casters only
  sun.layers.enable(LAYERS.shadowGather); // ...and lights the grass shadow gather pass too
  scene.add(sun, sun.target);

  // ---- world --------------------------------------------------------------------------------
  const layout = buildLayout();
  await breathe();
  // Phones cannot filter 32-bit float textures; they get the height map as half floats instead
  // (?halfheights forces that path on a desktop, to check it draws the same).
  const maps = bakeTerrainMaps(layout.ao, params.has('halfheights') || !renderer.extensions.has('OES_texture_float_linear'));
  G.uHeightTex.value = maps.heightTex;
  G.uSplatTex.value = maps.splatTex;
  G.uDetailTex.value = maps.detailTex;
  G.uRegion.value.set(REGION.minX, REGION.minZ, 1 / REGION.size, 1 / REGION.size);
  await breathe();

  const noise3D = makeCloudNoise3D(64);
  await breathe();
  const sky = new Sky({ noise3D, steps: quality.cloudSteps, scale: quality.cloudScale });
  scene.add(sky.mesh);
  scene.add(createMountains());
  scene.add(createTerrain());
  scene.add(createWater());
  await breathe();
  scene.add(createRocks(layout.rocks));
  scene.add(createTrees(layout.trees));
  await breathe();
  scene.add(createBushes(layout.bushes));
  await breathe();
  const groundCover = createGroundCover(quality);
  groundCover.userData.tuftColours.render(renderer); // static: one colour per tuft, worked out once
  scene.add(groundCover);
  await breathe();
  const wind = createWindFX();
  scene.add(wind.group);

  performance.mark('meadow:built'); // everything above is start-up work: textures, layout, geometry

  // ---- pipeline + dynamic resolution --------------------------------------------------------
  const pipeline = createPipeline(renderer, scene, camera, quality);

  const forcedDpr = params.has('dpr') ? parseFloat(params.get('dpr')) : null;
  const minScale = quality.minScale ?? 0.55;
  let resolutionScale = quality.startScale ?? 1; // lowered automatically when the GPU can't hold the frame rate

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    // a preset may also cap the pixel count, so a big tablet does not cost four phones
    const budget = Math.sqrt((quality.pixels ?? Infinity) / Math.max(1, w * h));
    const dpr = forcedDpr ?? Math.min(window.devicePixelRatio || 1, quality.dpr, budget) * resolutionScale;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    pipeline.setSize(w, h, dpr);
    sky.setSize(w, h);
    rig.setAspect(w / h);
  }
  window.addEventListener('resize', resize);
  resize();

  const perf = { time: 0, frames: 0, calm: 0, ceiling: 1, warmup: quality.eager ? 2 : 4 };
  function adaptResolution(dt) {
    if (still || forcedDpr !== null || document.hidden) return;
    if (perf.warmup > 0) { perf.warmup -= dt; return; } // ignore start-up shader compilation hitches
    perf.time += dt;
    perf.frames++;
    if (perf.time < 1.5) return;
    const ms = (perf.time / perf.frames) * 1000;
    perf.time = 0;
    perf.frames = 0;
    if (ms > 19.5 && resolutionScale > minScale) {
      // below ~50 fps: drop resolution, and remember not to climb straight back up. The handheld
      // presets drop in proportion to how slow the frames are (cost follows the pixel count, so
      // the scale follows its square root): a slow phone gets there in a step or two, not ten.
      const step = quality.eager ? Math.min(0.88, Math.max(0.6, Math.sqrt(17 / ms))) : 0.88;
      resolutionScale = Math.max(minScale, resolutionScale * step);
      perf.ceiling = resolutionScale * 1.07;
      perf.calm = 0;
      resize();
    } else if (ms < 17.4) {
      perf.calm++;
      if (perf.calm % 20 === 0) perf.ceiling = Math.min(1, perf.ceiling * 1.07); // slowly forget the ceiling
      const limit = Math.min(1, perf.ceiling);
      if (resolutionScale < limit - 0.005 && perf.calm % 4 === 0) {
        resolutionScale = Math.min(limit, resolutionScale * 1.06);
        resize();
      }
    }
  }

  // ---- interaction --------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return; // leave browser shortcuts alone
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName ?? '')) return;
    if (e.key.toLowerCase() === 'f') hooks.onFreeCamera?.(rig.toggleFree()); // the overlay steps aside
  });

  // ---- loop ---------------------------------------------------------------------------------
  const fixedTime = params.has('t') ? parseFloat(params.get('t')) : null;
  let last = performance.now();
  let time = 0;
  let frameIndex = 0;
  let lost = false;

  // Trees sway slowly and clouds drift slowly, so the two heaviest passes take turns: with the
  // default refresh of 2 the shadow map is redrawn on even frames and the cloud volume on odd
  // ones. The handheld presets stretch the cycle to 3 or 4 frames.
  const REFRESH = Math.max(2, Math.round(quality.refresh ?? 2));

  function renderFrame(forceBoth = false) {
    G.uTime.value = time;
    pipeline.grade.uniforms.uTime.value = time;
    const all = forceBoth || frameIndex === 0;
    const phase = frameIndex++ % REFRESH;
    wind.update(time);
    culler.update(camera);
    if (all || phase === 0) {
      // refresh the sun shadow map and, in the same call, the per-blade grass shadows that read it
      renderer.shadowMap.needsUpdate = true;
      groundCover.userData.shadowGather.render(renderer, scene);
    }
    // The cloud buffer is pasted in screen space, so on a long cycle it also has to follow the
    // camera while a finger is dragging the view around.
    if (all || phase === REFRESH >> 1 || rig.free || (REFRESH > 2 && rig.moving)) sky.render(renderer, camera, time);
    pipeline.render(rig.free);
  }

  // ?fps: a small readout for checking a real device (frame rate, rendered size, preset).
  const stats = params.has('fps') ? document.body.appendChild(document.createElement('div')) : null;
  if (stats) {
    stats.style.cssText = 'position:fixed;left:50%;top:env(safe-area-inset-top,0px);transform:translateX(-50%);z-index:9;' +
      'padding:3px 9px;border-radius:0 0 7px 7px;background:rgba(0,0,0,.62);color:#fff;white-space:nowrap;pointer-events:none;' +
      'font:600 11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace';
  }
  const meter = { time: 0, frames: 0, worst: 0 };
  function updateStats(seconds) {
    meter.time += seconds;
    meter.frames++;
    meter.worst = Math.max(meter.worst, seconds);
    if (meter.time < 1) return;
    stats.textContent = `${Math.round(meter.frames / meter.time)} fps · worst ${Math.round(meter.worst * 1000)} ms · ` +
      `${canvas.width}×${canvas.height} · ${quality.name} ${Math.round(resolutionScale * 100)}%`;
    meter.time = meter.frames = meter.worst = 0;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (stats) updateStats((now - last) / 1000);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (lost) return;
    time = fixedTime ?? time + dt;
    rig.update(dt, time);
    renderFrame();
    adaptResolution(dt);
  }

  // A phone may take the GPU context away from a page in the background. three.js brings its own
  // objects back when the context returns; the two things this scene bakes only once (the cloud
  // weather map and the grass tuft colours) have to be asked for again.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    hooks.onContextLost?.();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    sky.weatherBaked = false;
    groundCover.userData.tuftColours.render(renderer);
    frameIndex = 0; // the next frame redraws every pass
    lost = false;
    requestAnimationFrame(() => hooks.onFirstFrame?.());
  });

  // ---- debug hooks (used for measuring the render against the reference frame) ----------------
  const api = {
    renderer, scene, camera, rig, sky, sun, pipeline, G, culler, quality,
    /** Render one frame and return it as a PNG data URL. */
    capture(atTime) {
      if (atTime !== undefined) {
        time = atTime;
        rig.update(0, time);
      }
      renderFrame(true);
      return canvas.toDataURL('image/png');
    },
    /** Advance the animation by dt seconds and render one frame through the normal frame path. */
    step(dt = 1 / 60) {
      time += dt;
      rig.update(dt, time);
      renderFrame();
    },
  };
  window.__meadow = api;

  // resolves once the first picture is on screen (not before the tab is actually visible)
  await new Promise((resolve) => {
    requestAnimationFrame((now) => {
      last = now;
      frame(now);
      performance.mark('meadow:first-frame'); // shaders compiled, first picture drawn
      hooks.onFirstFrame?.();
      resolve();
    });
  });
  return api;
}
