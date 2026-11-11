'use client';

import { useEffect, useRef } from 'react';

type MeadowStageProps = {
  /** Shown on the dark veil while the scene is being built. */
  loading: string;
};

/**
 * The 3D meadow behind the page, plus the dark veil that covers it until its first picture is
 * on screen. Everything else on the page is server-rendered; this only starts things up in the
 * browser: the scene (meadow/start.js) and the overlay controller.
 *
 * ?scene=0 skips the scene (the page then sits on the veil), which helps when debugging layout.
 */
export const MeadowStage = ({ loading }: MeadowStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let unmountOverlay: (() => void) | undefined;

    const root = document.getElementById('ui');
    import('./overlay-controller').then(({ mountOverlay }) => {
      if (!cancelled && root) unmountOverlay = mountOverlay(root);
    });

    const canvas = canvasRef.current;
    const showScene = new URLSearchParams(location.search).get('scene') !== '0';
    if (canvas && showScene) {
      import('@/meadow/start')
        .then(({ startMeadow }) =>
          startMeadow(canvas, {
            onFirstFrame: () => veilRef.current?.classList.add('hidden'),
            onContextLost: () => veilRef.current?.classList.remove('hidden'),
            onFreeCamera: (free) =>
              document.body.classList.toggle('free-cam', free),
          }),
        )
        .catch((err) => {
          // no WebGL (old device, blocked GPU): a still of the meadow stands in for it
          console.warn('[meadow] the 3D scene could not start', err);
          document.documentElement.classList.add('no-webgl');
        });
    }

    return () => {
      cancelled = true;
      unmountOverlay?.();
    };
  }, []);

  return (
    <>
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      {/* the label is drawn from the attribute by CSS, so it is not part of the page's text */}
      <div id="veil" ref={veilRef} aria-hidden="true" data-label={loading} />
    </>
  );
};
