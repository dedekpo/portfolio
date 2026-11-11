// Far mountains: faceted crags sitting beyond the fog, two flat tones + mist pooling at the base.

import * as THREE from 'three';
import { HERO, PAL } from '../config.js';
import { mulberry32 } from '../core/noise.js';
import { FOCAL_PX, pixelRay } from '../core/refspace.js';
import { COMMON, G } from '../core/shaderlib.js';

function addPeak(out, cx, cz, baseY, apexY, radius, flat, haze, rng) {
  const sides = 6;
  const a0 = rng() * Math.PI * 2;
  const skewX = (rng() - 0.5) * radius * 0.5, skewZ = (rng() - 0.5) * radius * 0.5;
  const ring = [], top = [];
  for (let k = 0; k < sides; k++) {
    const a = a0 + (k / sides) * Math.PI * 2 + (rng() - 0.5) * 0.45;
    const r = radius * (0.8 + rng() * 0.45), rt = radius * flat * (0.6 + rng() * 0.8);
    ring.push([cx + Math.cos(a) * r, baseY, cz + Math.sin(a) * r]);
    top.push([cx + skewX + Math.cos(a) * rt, apexY * (0.86 + rng() * 0.14), cz + skewZ + Math.sin(a) * rt]);
  }
  const apex = [cx + skewX, apexY, cz + skewZ];
  const tri = (a, b, c) => { out.pos.push(...a, ...b, ...c); out.haze.push(haze, haze, haze); };
  for (let k = 0; k < sides; k++) {
    const k1 = (k + 1) % sides;
    tri(ring[k], top[k], ring[k1]);
    tri(ring[k1], top[k], top[k1]);
    tri(top[k], apex, top[k1]);
  }
}

export function createMountains() {
  const rng = mulberry32(4242);
  const out = { pos: [], haze: [] };

  // hero range, placed by pointing at reference pixels: [px, summit py, half width px, flatness, distance]
  const HERO_PEAKS = [
    [1104, 362, 30, 0.26, 2300], [1043, 381, 30, 0.2, 2450], [1077, 387, 20, 0.14, 2150],
    [1012, 393, 26, 0.22, 2600], [1141, 391, 24, 0.2, 2500], [1126, 377, 15, 0.14, 2350],
    [1190, 396, 30, 0.24, 2800], [960, 398, 28, 0.24, 2900],
  ];
  for (const [px, py, hw, flat, dist] of HERO_PEAKS) {
    const d = pixelRay(px, py);
    const t = dist / Math.hypot(d.x, d.z);
    const x = HERO.position.x + d.x * t, y = HERO.position.y + d.y * t, z = HERO.position.z + d.z * t;
    addPeak(out, x, z, -60, y, (t * hw) / FOCAL_PX * 1.25, flat, (dist - 2100) / 2600, rng);
  }
  // the rest of the horizon (only seen with the free camera)
  for (let i = 0; i < 46; i++) {
    const az = rng() * Math.PI * 2;
    const dir = [Math.sin(az), -Math.cos(az)];
    const facing = dir[1] * -1; // +1 straight ahead of the hero camera
    if (facing > 0.62) continue; // keep the hero frame clean
    const dist = 2300 + rng() * 1400;
    addPeak(out, dir[0] * dist, dir[1] * dist, -60, 90 + rng() * 240, 130 + rng() * 260, 0.15 + rng() * 0.3, 0.1 + rng() * 0.45, rng);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(out.pos, 3));
  geo.setAttribute('aHaze', new THREE.Float32BufferAttribute(out.haze, 1));
  geo.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      ...G,
      uLit: { value: PAL.mountainLit },
      uShd: { value: PAL.mountainShd },
      uMist: { value: PAL.mist },
    },
    vertexShader: /* glsl */ `
      attribute float aHaze;
      varying vec3 vWorld;
      varying float vHaze;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vHaze = aHaze;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${COMMON}
      uniform vec3 uLit;
      uniform vec3 uShd;
      uniform vec3 uMist;
      varying vec3 vWorld;
      varying float vHaze;
      void main() {
        vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        float light = smoothstep(-0.1, 0.45, dot(N, uSunDir));
        vec3 col = mix(uShd, uLit, light);
        col = mix(col, uFogFar, clamp(vHaze, 0.0, 0.7));
        float n = texture2D(uNoiseTex, vWorld.xz * 0.0006 + uTime * 0.002).r;
        col = mix(uMist, col, smoothstep(14.0, 70.0 + n * 60.0, vWorld.y));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  material.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 900; // after everything nearer, just before the sky
  mesh.name = 'mountains';
  return mesh;
}
