// Brings the server-rendered overlay (overlay.tsx) to life in the browser: draws the name three
// times for the line boil, runs the project card (hover with a mouse, tap on a touch screen) and
// starts the entrance. It only adds to the markup; without it the page still shows every word
// and every link.

import { NAME_ART } from './content';
import { artBox, fontLoaded, fontsReady, LETTERING, renderFrames, silhouette } from '../../meadow/lettering';

const SHADOW = '#08283a';
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- hand-drawn underline ---------------------------------------------------------------------
// A stroke through a few jittered points, three versions of it, so it boils like the name.

function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth path (Catmull-Rom as cubic Béziers) through the points. */
function spline(points) {
  const p = (i) => points[clamp(i, 0, points.length - 1)];
  let d = `M${p(0)[0].toFixed(2)} ${p(0)[1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${c[0].toFixed(2)} ${c[1].toFixed(2)}`;
  }
  return d;
}

function makeUnderline() {
  const base = [[1, 6], [18, 4.6], [38, 5.8], [60, 4.4], [80, 5.6], [99, 4.2]];
  const paths = [0, 1, 2].map((n) => {
    const rnd = mulberry(47 + n * 977);
    const pts = base.map(([x, y]) => [x + (rnd() - 0.5) * 2.5, y + (rnd() - 0.5) * 3]);
    return `<path d="${spline(pts)}"${n === 0 ? ' class="on"' : ''}/>`;
  });
  const el = document.createElement('span');
  el.className = 'underline';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<svg viewBox="0 0 100 10" preserveAspectRatio="none">${paths.join('')}</svg>`;
  return el;
}

/** Resolves when the font stylesheets added by the boot script are in (or failed, or 4 s passed). */
function fontSheets() {
  const links = [...document.querySelectorAll('link[data-fonts]')];
  const each = links.map((link) =>
    link.sheet
      ? Promise.resolve()
      : new Promise((resolve) => {
          link.addEventListener('load', resolve, { once: true });
          link.addEventListener('error', resolve, { once: true });
        }),
  );
  return Promise.race([Promise.all(each), wait(4000)]);
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });

/**
 * @param {HTMLElement} root the #ui element rendered by overlay.tsx
 * @returns {() => void} undoes everything (React runs effects twice in development)
 */
export function mountOverlay(root) {
  const $ = (sel) => root.querySelector(sel);
  const nameEl = $('.name'), artEl = $('.art-in'), work = $('.work'), card = $('.card');
  const cardImg = card.querySelector('img'), cardOpen = card.querySelector('.c-open');
  const fullName = $('.name-text').textContent.trim();

  const cleanups = [];
  const on = (target, type, fn, options) => {
    target.addEventListener(type, fn, options);
    cleanups.push(() => target.removeEventListener(type, fn, options));
  };

  /** Which arrangement the stylesheet has picked for this window: 'wide' or 'tall'. */
  const mode = () => getComputedStyle(root).getPropertyValue('--mode').trim() || 'wide';

  // ---- boil clock: everything hand-drawn changes drawing together, 8 times a second ----------
  const boilers = new Map(); // key -> { frames, at }
  function setBoiler(key, frames) {
    frames.forEach((f, i) => f.classList.toggle('on', i === 0));
    boilers.set(key, { frames, at: 0 });
  }
  function tick() {
    if (document.hidden) return;
    for (const b of boilers.values()) {
      const n = b.frames.length;
      if (n < 2) continue;
      const next = (b.at + 1 + Math.floor(Math.random() * (n - 1))) % n; // any drawing but the current one
      b.frames[b.at].classList.remove('on');
      b.frames[next].classList.add('on');
      b.at = next;
    }
  }
  let clock = 0;
  function runClock() {
    clearInterval(clock);
    if (!reducedMotion()) clock = setInterval(tick, 1000 / (NAME_ART.fps || 8));
  }
  runClock();
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener?.('change', runClock);
  cleanups.push(() => {
    clearInterval(clock);
    motionQuery.removeEventListener?.('change', runClock);
  });

  const underline = makeUnderline();
  setBoiler('underline', [...underline.querySelectorAll('path')]);

  // ---- the name ------------------------------------------------------------------------------
  const inkColour = () => {
    const m = /^#?([0-9a-f]{6})$/i.exec(getComputedStyle(root).getPropertyValue('--name-ink').trim());
    const n = m ? parseInt(m[1], 16) : 0xfaf3e0;
    return [n >> 16, (n >> 8) & 255, n & 255];
  };

  function placeFrames(frames, shadowSource, aspect, bleedY) {
    nameEl.style.aspectRatio = String(aspect);
    nameEl.style.setProperty('--bleed-y', `${bleedY * 100}%`);
    const shadows = ['soft', 'tight'].map((kind) => {
      const s = silhouette(shadowSource, SHADOW, 900);
      s.className = `shadow ${kind}`;
      return s;
    });
    frames.forEach((f) => f.classList.add('f'));
    artEl.replaceChildren(...shadows, ...frames);
    setBoiler('name', frames);
  }

  let renderToken = 0;
  let usedFallbackFace = false;
  let renderedWidth = 0;
  async function renderName() {
    const token = ++renderToken;
    usedFallbackFace = false;

    if (NAME_ART.frames.length > 0) {
      try {
        const images = await Promise.all(NAME_ART.frames.map(loadImage));
        if (token !== renderToken) return;
        const box = artBox(images[0].naturalWidth, images[0].naturalHeight);
        const frames = images.map((img) => {
          if (!NAME_ART.tint) return img;
          const span = document.createElement('span');
          span.className = 'tinted';
          span.style.setProperty('--src', `url("${img.src}")`);
          return span;
        });
        placeFrames(frames, images[0], box.aspect, box.bleedY);
        root.dataset.name = 'drawn';
        renderedWidth = nameEl.getBoundingClientRect().width;
        return;
      } catch (err) {
        console.warn(`[portfolio] ${err.message}; showing the simulated lettering instead`);
      }
    }

    await fontSheets();
    await fontsReady(LETTERING, fullName);
    if (token !== renderToken) return;
    const width = nameEl.getBoundingClientRect().width;
    if (!width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    usedFallbackFace = !fontLoaded(LETTERING, fullName);
    const out = renderFrames(LETTERING, [fullName], 'center', Math.round(width * dpr), inkColour());
    placeFrames(out.frames, out.frames[0], out.inkW / out.inkH, out.pad / out.inkH);
    root.dataset.name = 'simulated';
    renderedWidth = width;
  }
  // a slow connection can leave the name set in the fallback face: redraw when the real one lands
  const onFontsLoaded = () => {
    if (usedFallbackFace) renderName();
  };
  document.fonts?.addEventListener?.('loadingdone', onFontsLoaded);
  cleanups.push(() => document.fonts?.removeEventListener?.('loadingdone', onFontsLoaded));

  // ---- project card --------------------------------------------------------------------------
  // With a mouse the card follows the pointer from project to project and a click goes straight
  // to the site. A finger cannot hover, so there the first tap opens the card and the card
  // carries the link (a second tap on the same project follows it too).
  let hideTimer = 0;
  let current = null;
  let pinned = false;
  let lastPointer = 'mouse';
  on(window, 'pointerdown', (e) => { lastPointer = e.pointerType || 'mouse'; }, true);

  function fillCard(link) {
    const host = new URL(link.href).host.replace(/^www\./, '');
    const name = link.querySelector('.pname').textContent;
    cardImg.hidden = true; // the project's initial shows until its picture is in
    cardImg.onload = () => { if (current === link) cardImg.hidden = false; };
    cardImg.onerror = () => { cardImg.hidden = true; };
    cardImg.src = link.dataset.thumb;
    if (cardImg.complete && cardImg.naturalWidth) cardImg.hidden = false;
    card.querySelector('b').textContent = name[0];
    card.querySelector('strong').textContent = name;
    card.querySelector('.c-meta span').textContent = `${link.dataset.kind} · ${host}`;
    card.querySelector('p').textContent = link.querySelector('.pdesc').textContent;
    cardOpen.href = link.href;
    cardOpen.firstElementChild.textContent = `Open ${host}`;
  }

  function showCard(link, pin = false) {
    clearTimeout(hideTimer);
    if (current !== link) {
      current?.classList.remove('is-open');
      current = link;
      fillCard(link);
      link.classList.add('is-open');
      link.querySelector('.pname').append(underline);
    }
    pinned = pin;
    card.classList.toggle('pinned', pin);
    card.setAttribute('aria-hidden', String(!pin));
    cardOpen.tabIndex = pin ? 0 : -1;
    work.classList.add('has-open');

    const tall = mode() === 'tall';
    const gap = parseFloat(getComputedStyle(card).paddingTop) * 1.3;
    const r = (tall ? work : link).getBoundingClientRect();
    const w = card.offsetWidth, h = card.offsetHeight;
    // wide: above the project, centred on it. tall: one fixed spot, centred above the whole list
    const x = clamp((tall ? innerWidth / 2 : r.left + r.width / 2) - w / 2, 12, innerWidth - w - 12);
    const y = clamp(r.top - h - gap, 12, innerHeight - h - 12);
    const moving = card.classList.contains('show');
    if (!moving) card.style.transition = 'none'; // first appearance: fade in place, do not fly in
    card.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
    if (!moving) {
      void card.offsetWidth;
      card.style.transition = '';
    }
    card.classList.add('show');
  }

  function hideCard(now) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      card.classList.remove('show', 'pinned');
      card.setAttribute('aria-hidden', 'true');
      cardOpen.tabIndex = -1;
      work.classList.remove('has-open');
      current?.classList.remove('is-open');
      underline.remove();
      current = null;
      pinned = false;
    }, now ? 0 : 110);
  }
  cleanups.push(() => {
    clearTimeout(hideTimer);
    hideCard(true);
  });

  on(work, 'pointerover', (e) => {
    const link = e.target.closest('.proj');
    if (link && e.pointerType === 'mouse' && !pinned) showCard(link);
  });
  on(work, 'pointerout', (e) => {
    const link = e.target.closest('.proj');
    if (link && e.pointerType === 'mouse' && !pinned && !link.contains(e.relatedTarget)) hideCard();
  });
  on(work, 'focusin', (e) => {
    const link = e.target.closest('.proj');
    if (link?.matches(':focus-visible') && !pinned) showCard(link);
  });
  on(work, 'focusout', () => { if (!pinned) hideCard(); });
  on(work, 'click', (e) => {
    const link = e.target.closest('.proj');
    if (!link || lastPointer === 'mouse') return;
    if (pinned && current === link) return; // second tap: follow the link
    e.preventDefault();
    showCard(link, true);
  });
  // a tap anywhere else puts the card away
  on(window, 'pointerdown', (e) => {
    if (pinned && !e.target.closest?.('#ui .proj, #ui .card')) hideCard(true);
  });
  on(window, 'keydown', (e) => {
    if (e.key === 'Escape' && pinned) hideCard(true);
  });

  let resizeTimer = 0;
  on(window, 'resize', () => {
    hideCard(true);
    clearTimeout(resizeTimer);
    // frames stretch while the window is dragged, then are redrawn crisp; a resize that leaves
    // the name the same size (a phone's toolbar sliding away) redraws nothing
    resizeTimer = setTimeout(() => {
      if (Math.abs(nameEl.getBoundingClientRect().width - renderedWidth) > 0.5) renderName();
    }, 180);
  });
  cleanups.push(() => clearTimeout(resizeTimer));

  // ---- start ---------------------------------------------------------------------------------
  // The entrance plays as soon as the name is drawn; the meadow fades in behind it whenever it
  // is ready, so the words never wait for the 3D scene.
  let alive = true;
  renderName()
    .catch((err) => {
      console.warn('[portfolio] could not draw the name', err);
      root.classList.add('no-art'); // the plain text name stays visible instead
    })
    .finally(() => {
      if (alive) root.classList.add('is-in');
    });

  // with a mouse the card should be instant, so fetch the pictures once the page has settled;
  // on a phone they are only fetched for the projects that get tapped
  let preload = 0;
  if (window.matchMedia('(hover: hover)').matches) {
    preload = setTimeout(() => {
      root.querySelectorAll('.proj').forEach((link) => { new Image().src = link.dataset.thumb; });
    }, 4000);
  }
  cleanups.push(() => clearTimeout(preload));

  window.__portfolio = {
    /** Try drawn frames without editing content.ts: setArt(['/name/boil-1.png', ...]). */
    setArt(frames, tint = true) {
      Object.assign(NAME_ART, { frames, tint });
      return renderName();
    },
    /** How far the simulated passes stray from each other: 0 still, 1 gentle, 1.8 lively. */
    setBoil(strength) {
      LETTERING.boil = Number.isFinite(strength) ? clamp(strength, 0, 4) : 1;
      return renderName();
    },
  };

  return () => {
    alive = false;
    renderToken++;
    cleanups.forEach((fn) => fn());
    artEl.replaceChildren();
    root.classList.remove('is-in', 'no-art');
    delete window.__portfolio;
  };
}
