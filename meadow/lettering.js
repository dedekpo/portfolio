// The name, drawn three times.
//
// A line boil is the same drawing made again and again by hand: every pass lands a hair off, so
// the line never sits still. Until the real drawings exist this file fakes the passes. It sets
// the name in a font, turns the letters into a distance field, and re-traces that field three
// times with a different wobble, registration error and ink weight each time. The page then
// flips between the three canvases (see the boil clock in portfolio.js).
//
// The same geometry is used for the tracing guide, so hand-drawn frames exported at the guide's
// canvas size drop into exactly the same box.

/** Transparent margin around the ink, as a fraction of the ink width. Guide and frames share it. */
export const BLEED = 0.05;

// The face the name is set in: Fraunces, in the soft "wonky" display cut (see FONT_SHEETS in
// portfolio.js). `leading` is the line pitch if the name is ever stacked and `tracking` the
// letter spacing, both in em. `boil` is how far the three passes stray from each other:
// 0 = a still drawing, 1 = gentle, about 1.8 = lively.
export const LETTERING = {
  label: 'Storybook',
  family: 'Fraunces',
  weight: 600,
  leading: 0.9,
  tracking: -0.012,
  boil: 1,
};

const NOMINAL = 200; // the font is always set at this size and scaled, so metrics stay precise
const fontOf = (spec) => `${spec.weight} ${NOMINAL}px "${spec.family}"`;

/**
 * True when nothing is left to load for this text. Note that this is also true while the font
 * stylesheet itself has not arrived yet, so only ask once the stylesheets are in.
 */
export function fontLoaded(spec, text) {
  return document.fonts?.check ? document.fonts.check(fontOf(spec), text) : true;
}

/** Resolves once the face is usable in a canvas (or after a short wait, with the fallback face). */
export function fontsReady(spec, text) {
  if (!document.fonts?.load || fontLoaded(spec, text)) return Promise.resolve();
  return Promise.race([
    document.fonts.load(fontOf(spec), text).catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
}

function setType(ctx, spec) {
  ctx.font = fontOf(spec);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${(spec.tracking ?? 0) * NOMINAL}px`;
}

let scratch = null;

/** Ink box of the lines at the nominal size, plus the pen origin of each line inside it. */
function measure(spec, lines, align) {
  scratch ??= document.createElement('canvas').getContext('2d');
  setType(scratch, spec);
  const boxes = lines.map((text) => {
    const m = scratch.measureText(text);
    return { left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, up: m.actualBoundingBoxAscent, down: m.actualBoundingBoxDescent };
  });
  const width = Math.max(...boxes.map((b) => b.right - b.left));
  const pitch = spec.leading * NOMINAL;
  const height = boxes[0].up + pitch * (lines.length - 1) + boxes[boxes.length - 1].down;
  // lines are aligned by their ink, not by their advance width, so edges are optically true
  const origins = boxes.map((b, i) => ({
    x: align === 'left' ? -b.left : align === 'right' ? width - b.right : (width - (b.right - b.left)) / 2 - b.left,
    y: boxes[0].up + pitch * i,
  }));
  return { width, height, origins };
}

/** Sets the lines in a canvas whose ink is `inkWidth` pixels wide, with the shared bleed around it. */
function typeset(spec, lines, align, inkWidth, fill) {
  const m = measure(spec, lines, align);
  const k = inkWidth / m.width;
  const pad = Math.ceil(inkWidth * BLEED);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(inkWidth) + pad * 2;
  canvas.height = Math.ceil(m.height * k) + pad * 2;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.setTransform(k, 0, 0, k, pad, pad);
  setType(ctx, spec);
  ctx.fillStyle = fill;
  lines.forEach((text, i) => ctx.fillText(text, m.origins[i].x, m.origins[i].y));
  return { canvas, ctx, pad, em: NOMINAL * k, inkW: inkWidth, inkH: m.height * k };
}

/** The clean lettering, large, to draw over. */
export function renderGuide(spec, lines, align, inkWidth = 3200) {
  return typeset(spec, lines, align, inkWidth, '#17191b').canvas;
}

/** Where the ink box sits inside a drawing exported at the guide's proportions. */
export function artBox(naturalWidth, naturalHeight) {
  const inkW = naturalWidth / (1 + 2 * BLEED);
  const pad = inkW * BLEED;
  const inkH = Math.max(1, naturalHeight - 2 * pad);
  return { aspect: inkW / inkH, bleedY: pad / inkH };
}

// ---- distance field ---------------------------------------------------------------------------
// Felzenszwalb & Huttenlocher's exact transform, seeded from the antialiased coverage so the
// field is accurate to a fraction of a pixel (the trick used by Mapbox's TinySDF).

const INF = 1e20;

function edt1d(grid, offset, stride, length, f, v, z) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];
  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    grid[offset + q * stride] = f[r] + (q - r) * (q - r);
  }
}

function edt(grid, w, h, f, v, z) {
  for (let x = 0; x < w; x++) edt1d(grid, x, w, h, f, v, z);
  for (let y = 0; y < h; y++) edt1d(grid, y * w, 1, w, f, v, z);
}

/** Signed distance to the letter edge in pixels, positive inside the ink. */
function signedDistance(rgba, w, h) {
  const n = w * h;
  const outer = new Float64Array(n);
  const inner = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = rgba[i * 4 + 3] / 255;
    if (a === 0) {
      outer[i] = INF;
    } else if (a === 1) {
      inner[i] = INF;
    } else {
      const d = 0.5 - a;
      outer[i] = d > 0 ? d * d : 0;
      inner[i] = d < 0 ? d * d : 0;
    }
  }
  const size = Math.max(w, h);
  const f = new Float64Array(size);
  const z = new Float64Array(size + 1);
  const v = new Uint32Array(size);
  edt(outer, w, h, f, v, z);
  edt(inner, w, h, f, v, z);
  const sd = new Float32Array(n);
  for (let i = 0; i < n; i++) sd[i] = Math.sqrt(inner[i]) - Math.sqrt(outer[i]);
  return sd;
}

// ---- smooth noise -----------------------------------------------------------------------------

const LATTICE = 256;
const lattice = new Float32Array(LATTICE * LATTICE);
{
  let s = 0x9e3779b9;
  for (let i = 0; i < lattice.length; i++) {
    // mulberry32
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    lattice[i] = (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  }
}

/** Value noise in -1..1. */
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const x0 = xi & 255, x1 = (xi + 1) & 255;
  const y0 = (yi & 255) * LATTICE, y1 = ((yi + 1) & 255) * LATTICE;
  const a = lattice[y0 + x0], b = lattice[y0 + x1], c = lattice[y1 + x0], d = lattice[y1 + x1];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smooth = (t) => t * t * (3 - 2 * t);

// ---- one drawing pass -------------------------------------------------------------------------

const WARP_CELL = 6; // the wobble is smooth, so it is worked out on a coarse grid and interpolated

function take(sd, w, h, em, ink, index, strength) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(w, h);
  const px = image.data;

  // each pass reads the noise somewhere else
  const o1 = 13.7 + index * 37.1, o2 = 91.3 + index * 17.9, o3 = 5.9 + index * 53.3, o4 = 61.1 + index * 29.7;
  const hash = (n) => noise(n * 12.9898 + index * 78.233, n * 4.1414 + index * 3.7);

  const wob = strength * em;
  const A1 = 0.012 * wob, L1 = 0.5 * em; // the stroke drifting off the guide
  const A2 = 0.005 * wob, L2 = 0.14 * em; // hand tremor
  const tooth = 0.0032 * wob, L3 = 0.028 * em; // ragged ink edge
  // registration error of the whole drawing, and how heavy this pass came out
  const offX = hash(1) * 0.006 * wob, offY = hash(2) * 0.006 * wob, turn = hash(3) * 0.004 * strength;
  const weight = hash(4) * 0.0035 * wob;

  const gw = Math.ceil(w / WARP_CELL) + 2, gh = Math.ceil(h / WARP_CELL) + 2;
  const warpX = new Float32Array(gw * gh), warpY = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) {
      const x = i * WARP_CELL, y = j * WARP_CELL;
      warpX[j * gw + i] = offX - turn * (y - h / 2) + A1 * noise(x / L1 + o1, y / L1 + o2) + A2 * noise(x / L2 + o2, y / L2 + o3);
      warpY[j * gw + i] = offY + turn * (x - w / 2) + A1 * noise(x / L1 + o3, y / L1 + o1) + A2 * noise(x / L2 + o4, y / L2 + o1);
    }
  }

  // pixels further than this from the edge cannot change, so they skip the noise
  const reach = (A1 + A2) * 1.5 + Math.abs(offX) + Math.abs(offY) + Math.abs(turn) * (w + h) * 0.5 + tooth + Math.abs(weight) + 2.5;
  const [r, g, b] = ink;
  const xMax = w - 1.001, yMax = h - 1.001;

  for (let y = 0; y < h; y++) {
    const fy = y / WARP_CELL, j = fy | 0, ty = fy - j;
    for (let x = 0; x < w; x++) {
      const here = sd[y * w + x];
      if (here < -reach) continue;
      let alpha = 1;
      if (here <= reach) {
        const fx = x / WARP_CELL, i = fx | 0, tx = fx - i;
        const c = j * gw + i;
        const dx = (warpX[c] * (1 - tx) + warpX[c + 1] * tx) * (1 - ty) + (warpX[c + gw] * (1 - tx) + warpX[c + gw + 1] * tx) * ty;
        const dy = (warpY[c] * (1 - tx) + warpY[c + 1] * tx) * (1 - ty) + (warpY[c + gw] * (1 - tx) + warpY[c + gw + 1] * tx) * ty;
        let sx = x + dx, sy = y + dy;
        sx = sx < 0 ? 0 : sx > xMax ? xMax : sx;
        sy = sy < 0 ? 0 : sy > yMax ? yMax : sy;
        const x0 = sx | 0, y0 = sy | 0, ax = sx - x0, ay = sy - y0, p = y0 * w + x0;
        const d = (sd[p] * (1 - ax) + sd[p + 1] * ax) * (1 - ay) + (sd[p + w] * (1 - ax) + sd[p + w + 1] * ax) * ay
          + weight + tooth * noise(x / L3 + o4, y / L3 + o2);
        alpha = smooth(clamp01(d / 1.5 + 0.5));
        if (alpha <= 0) continue;
      }
      const o = (y * w + x) * 4;
      px[o] = r;
      px[o + 1] = g;
      px[o + 2] = b;
      px[o + 3] = alpha * 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Three passes of the lettering as canvases, all the same size: the ink box plus the bleed. */
export function renderFrames(spec, lines, align, inkWidth, ink, count = 3) {
  const src = typeset(spec, lines, align, inkWidth, '#000');
  const { width: w, height: h } = src.canvas;
  const sd = signedDistance(src.ctx.getImageData(0, 0, w, h).data, w, h);
  const frames = [];
  for (let i = 0; i < count; i++) frames.push(take(sd, w, h, src.em, ink, i, spec.boil ?? 1));
  return { frames, pad: src.pad, inkW: src.inkW, inkH: src.inkH, em: src.em };
}

/** A flat silhouette of a frame in another colour (used for the soft shadow under the name). */
export function silhouette(source, colour, maxWidth = 1024) {
  const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
  const k = Math.min(1, maxWidth / sw); // it only ever gets blurred, so it can be small
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sw * k));
  canvas.height = Math.max(1, Math.round(sh * k));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}
