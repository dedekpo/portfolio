// Stylized stream: milky sky reflection, depth-tinted body, wind-driven ripples, shoreline foam.
// Depth comes from the baked terrain height map, so no extra depth pre-pass is needed.

import * as THREE from 'three';
import { PAL } from '../config.js';
import { COMMON, litUniforms, REGION, SHADOW_PARS_FRAGMENT, SHADOW_PARS_VERTEX } from '../core/shaderlib.js';
import { STREAM_TIP, WATER_LEVEL } from './heightfield.js';

export function createWater() {
  const x0 = -125, x1 = STREAM_TIP.x + 4, z0 = -30, z1 = -1;
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, 1, 1);
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, WATER_LEVEL, (z0 + z1) / 2);

  const material = new THREE.ShaderMaterial({
    lights: true,
    transparent: true,
    depthWrite: false,
    uniforms: litUniforms({
      uShallow: { value: PAL.waterShallow },
      uDeep: { value: PAL.waterDeep },
      uSkyTint: { value: PAL.waterSky },
      uFoam: { value: PAL.waterFoam },
      uWaterLevel: { value: WATER_LEVEL },
    }),
    vertexShader: /* glsl */ `
      #include <common>
      ${COMMON}
      ${SHADOW_PARS_VERTEX}
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
        setSunShadowCoord(wp.xyz, vec3(0.0, 1.0, 0.0));
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      ${COMMON}
      ${REGION}
      ${SHADOW_PARS_FRAGMENT}
      uniform vec3 uShallow;
      uniform vec3 uDeep;
      uniform vec3 uSkyTint;
      uniform vec3 uFoam;
      uniform float uWaterLevel;
      varying vec3 vWorld;

      void main() {
        vec2 xz = vWorld.xz;
        float depth = uWaterLevel - terrainHeightAt(xz) + shoreWobble(xz);
        if (depth < -0.02) discard;

        vec3 V = normalize(cameraPosition - vWorld);
        vec2 flow = uWindDir * uTime;
        float gust = windGust(xz);

        // two scrolling noise layers -> ripple slope
        vec2 n1 = texture2D(uNoiseTex, xz * 0.19 + flow * 0.021).rg - 0.5;
        vec2 n2 = texture2D(uNoiseTex, xz * 0.47 - flow * 0.034 + 0.31).ga - 0.5;
        vec2 slope = (n1 * 0.6 + n2 * 0.4) * (0.09 + 0.12 * gust);
        vec3 N = normalize(vec3(slope.x, 1.0, slope.y));

        float fres = pow(1.0 - sat(dot(N, V)), 4.0);
        vec3 R = reflect(-V, N);
        R.y = abs(R.y);
        vec3 refl = mix(skyGradient(R), uSkyTint, 0.6);

        // broad soft highlights sliding downwind (the pale streaks on the reference water)
        float streak = texture2D(uNoiseTex, vec2(xz.x * 0.045, xz.y * 0.21) + flow * vec2(0.012, 0.004)).r;
        refl += vec3(0.085) * smoothstep(0.52, 0.8, streak) * (0.6 + 0.4 * gust);

        vec3 body = mix(uShallow, uDeep, smoothstep(0.0, 0.45, depth));
        vec3 col = mix(body, refl, 0.3 + 0.65 * fres);

        // lapping foam line at the shore
        float foamN = texture2D(uNoiseTex, xz * 1.1 + flow * 0.05).a;
        float lap = sin(uTime * 0.9 + foamN * 6.0) * 0.012;
        float foam = 1.0 - smoothstep(0.0, 0.06 + foamN * 0.05 + lap, depth);
        col = mix(col, uFoam, foam * 0.5);

        float sh = sunShadow(3.0, pixelPhi());
        col *= mix(vec3(0.5, 0.6, 0.68), vec3(1.0), sh);

        col = applyFog(col, vWorld, sh);
        // the bed shows through the shallows (sand bars, the sloping beach), less so at a glancing angle
        float clear = (1.0 - smoothstep(0.02, 0.3, depth)) * (1.0 - fres * 0.6);
        float alpha = smoothstep(-0.012, 0.012, depth) * max(mix(0.96, 0.5, clear), foam * 0.7);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.renderOrder = 10;
  mesh.frustumCulled = false;
  mesh.name = 'water';
  return mesh;
}
