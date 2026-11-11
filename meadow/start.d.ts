// Types for start.js, so the TypeScript side of the app can call into the scene without the
// compiler having to read the scene's own (plain JavaScript) modules.

export type MeadowHooks = {
  /** The first picture is on screen (also after a lost GPU context came back). */
  onFirstFrame?: () => void;
  /** F switched the free camera on or off. */
  onFreeCamera?: (free: boolean) => void;
  /** The browser took the GPU context away. */
  onContextLost?: () => void;
};

/**
 * Builds the scene on `canvas` and starts drawing it. Safe to call more than once.
 * Rejects when WebGL is not available.
 */
export function startMeadow(
  canvas: HTMLCanvasElement,
  hooks?: MeadowHooks,
): Promise<unknown>;
